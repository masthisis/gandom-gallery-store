/**
 * Digipay UPG adapter — wraps WebbyCommerce orders
 */

import { applyCheckoutProfile } from '../../../utils/apply-checkout-profile';
import { notifyAdmin } from '../../../utils/notify-admin';

type PaymentSettings = {
  enabled?: boolean;
  mockMode?: boolean;
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  callbackUrl?: string;
};

let cachedToken: { access: string; refresh: string; expiresAt: number } | null = null;

async function getPaymentSettings(strapi: any): Promise<PaymentSettings> {
  try {
    return (
      (await strapi.documents('api::payment-setting.payment-setting').findFirst({})) || {
        enabled: false,
        mockMode: true,
        baseUrl: 'https://uat.mydigipay.info',
      }
    );
  } catch {
    return { enabled: false, mockMode: true, baseUrl: 'https://uat.mydigipay.info' };
  }
}

async function getAccessToken(settings: PaymentSettings): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.access;
  }
  const base = (settings.baseUrl || 'https://uat.mydigipay.info').replace(/\/$/, '');
  const basic = Buffer.from(`${settings.clientId}:${settings.clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    username: settings.username || '',
    password: settings.password || '',
    grant_type: 'password',
  });
  const res = await fetch(`${base}/digipay/api/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Digipay OAuth failed: ${res.status}`);
  }
  const data: any = await res.json();
  cachedToken = {
    access: data.access_token,
    refresh: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  };
  return cachedToken.access;
}

function tomanToRial(toman: number): number {
  return Math.round(Number(toman) * 10);
}

async function resolveUser(ctx: any) {
  if (ctx.state.user) return ctx.state.user;
  const auth = ctx.request.header.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const payload = await strapi.plugin('users-permissions').service('jwt').verify(auth.slice(7));
    return strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: payload.id } });
  } catch {
    return null;
  }
}

export default {
  async createTicket(ctx: any) {
    const user = await resolveUser(ctx);
    if (!user) {
      return ctx.unauthorized('برای پرداخت وارد شوید');
    }
    const { orderId, orderDocumentId, cellNumber, amountToman, profileSnapshot } =
      ctx.request.body || {};
    if (!orderId && !orderDocumentId) {
      return ctx.badRequest('شناسه سفارش الزامی است');
    }

    const settings = await getPaymentSettings(strapi);
    const callbackUrl =
      settings.callbackUrl ||
      process.env.DIGIPAY_CALLBACK_URL ||
      'http://localhost:5173/payment/callback';

    const providerId = String(orderDocumentId || orderId || Date.now());
    const amount = tomanToRial(Number(amountToman) || 0);
    if (!amount || amount < 1000) {
      return ctx.badRequest('مبلغ نامعتبر است');
    }

    const snapshotMeta = {
      mock: true,
      providerId,
      userId: user.id,
      profileSnapshot: profileSnapshot || null,
    };

    // Block mock payments in production unless mockMode is intentionally on
    if (process.env.NODE_ENV === 'production' && !settings.mockMode && !settings.enabled) {
      return ctx.badRequest('درگاه پرداخت پیکربندی نشده است');
    }

    if (settings.mockMode || !settings.enabled) {
      if (process.env.NODE_ENV === 'production' && !settings.mockMode) {
        return ctx.badRequest('پرداخت غیرفعال است');
      }
      const mockTicket = `MOCK-${providerId}`;
      try {
        await strapi.db.query('plugin::webbycommerce.payment-transaction').create({
          data: {
            transaction_id: mockTicket,
            amount: Number(amountToman),
            currency: 'IRR',
            status: 'pending',
            gateway_response: snapshotMeta,
          },
        });
      } catch (e) {
        strapi.log.warn('[digipay] could not create payment-transaction', e);
      }

      ctx.body = {
        ok: true,
        mock: true,
        ticket: mockTicket,
        redirectUrl: `${callbackUrl}?status=SUCCESS&providerId=${encodeURIComponent(providerId)}&ticket=${mockTicket}&mock=1`,
        providerId,
      };
      return;
    }

    try {
      const token = await getAccessToken(settings);
      const base = (settings.baseUrl || '').replace(/\/$/, '');
      const res = await fetch(`${base}/digipay/api/tickets/business?type=11`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cellNumber: cellNumber || user?.phone_no,
          amount,
          providerId,
          callbackUrl,
        }),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        strapi.log.error('[digipay] ticket error', data);
        return ctx.badRequest('ایجاد تیکت پرداخت ناموفق بود');
      }

      const ticket = data.ticket || data.result?.ticket || data.data?.ticket;
      const redirectUrl =
        data.redirectUrl ||
        data.result?.redirectUrl ||
        data.paymentUrl ||
        `${base}/digipay/payment?ticket=${ticket}`;

      try {
        await strapi.db.query('plugin::webbycommerce.payment-transaction').create({
          data: {
            transaction_id: String(ticket),
            amount: Number(amountToman),
            currency: 'IRR',
            status: 'pending',
            gateway_response: {
              ...data,
              userId: user?.id || null,
              profileSnapshot: profileSnapshot || null,
              providerId,
            },
          },
        });
      } catch (e) {
        strapi.log.warn('[digipay] payment-transaction create failed', e);
      }

      ctx.body = { ok: true, ticket, redirectUrl, providerId, raw: data };
    } catch (err: any) {
      strapi.log.error('[digipay] createTicket', err);
      return ctx.badRequest(err.message || 'خطای درگاه');
    }
  },

  async callback(ctx: any) {
    const q = { ...ctx.request.query, ...ctx.request.body };
    const providerId = String(q.providerId || q.provider_id || '');
    const status = String(q.status || q.result || '').toUpperCase();
    const ticket = String(q.ticket || '');
    const isMock = q.mock === '1' || q.mock === 1 || q.mock === true;

    const settings = await getPaymentSettings(strapi);

    // Reject forged mock callbacks when real gateway is enabled in production
    if (
      isMock &&
      process.env.NODE_ENV === 'production' &&
      settings.enabled &&
      !settings.mockMode
    ) {
      ctx.body = { ok: false, status: 'failed', reason: 'mock_not_allowed' };
      return;
    }

    const success = status.includes('SUCCESS') || status === '0' || status === 'OK' || isMock;

    if (success && providerId) {
      try {
        let order =
          (await strapi.db.query('plugin::webbycommerce.order').findOne({
            where: { order_number: providerId },
          })) ||
          (await strapi.db.query('plugin::webbycommerce.order').findOne({
            where: { id: Number(providerId) || 0 },
          }));

        if (!order) {
          try {
            order = await strapi.documents('plugin::webbycommerce.order').findOne({
              documentId: providerId,
            });
          } catch {
            /* ignore */
          }
        }

        if (order) {
          await strapi.db.query('plugin::webbycommerce.order').update({
            where: { id: order.id },
            data: {
              payment_status: 'paid',
              status: order.status === 'pending' ? 'processing' : order.status,
              payment_method: 'COD',
            },
          });
        }

        if (ticket) {
          const tx = await strapi.db.query('plugin::webbycommerce.payment-transaction').findOne({
            where: { transaction_id: ticket },
          });
          if (tx) {
            const meta = tx.gateway_response || {};
            await strapi.db.query('plugin::webbycommerce.payment-transaction').update({
              where: { id: tx.id },
              data: {
                status: 'completed',
                gateway_response: { ...meta, callback: q },
              },
            });

            const userId = meta.userId || order?.user?.id || order?.user;
            const snapshot = meta.profileSnapshot;
            if (userId && snapshot) {
              try {
                await applyCheckoutProfile(strapi, Number(userId), snapshot);
              } catch (err) {
                strapi.log.warn('[digipay] applyCheckoutProfile failed', err);
              }
            }
          }
        }

        await notifyAdmin(strapi, 'order_paid', {
          providerId,
          order_number: order?.order_number || providerId,
          ticket,
          amountToman: order?.total ?? null,
          userId: order?.user?.id || order?.user || null,
          at: new Date().toISOString(),
        });
      } catch (e) {
        strapi.log.error('[digipay] callback update failed', e);
      }
    } else if (!success) {
      let amountToman: number | null = null;
      let userId: unknown = null;
      try {
        if (ticket) {
          const tx = await strapi.db.query('plugin::webbycommerce.payment-transaction').findOne({
            where: { transaction_id: ticket },
          });
          if (tx) {
            amountToman = tx.amount != null ? Number(tx.amount) : null;
            userId = tx.gateway_response?.userId || null;
            await strapi.db.query('plugin::webbycommerce.payment-transaction').update({
              where: { id: tx.id },
              data: {
                status: 'failed',
                gateway_response: { ...(tx.gateway_response || {}), callback: q },
              },
            });
          }
        }
      } catch (e) {
        strapi.log.warn('[digipay] failed payment tx update', e);
      }

      await notifyAdmin(strapi, 'payment_failed', {
        providerId,
        ticket,
        status,
        amountToman,
        userId,
        at: new Date().toISOString(),
        details: q,
      });
    }

    if (!isMock && settings.enabled && !settings.mockMode && ticket) {
      try {
        const token = await getAccessToken(settings);
        const base = (settings.baseUrl || '').replace(/\/$/, '');
        await fetch(`${base}/digipay/api/purchases/verify`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticket }),
        });
      } catch (e) {
        strapi.log.warn('[digipay] verify call failed', e);
      }
    }

    ctx.body = {
      ok: success,
      status: success ? 'paid' : 'failed',
      providerId,
      ticket,
    };
  },

  async refund(ctx: any) {
    // Refunds are admin-only: require shared secret (not public)
    const secret = process.env.DIGIPAY_REFUND_SECRET || '';
    const provided = String(
      ctx.request.header['x-refund-secret'] || ctx.request.body?.refundSecret || ''
    );
    if (!secret || provided !== secret) {
      return ctx.unauthorized('مجوز بازگشت وجه وجود ندارد');
    }

    const { ticket, amountToman } = ctx.request.body || {};
    if (!ticket) return ctx.badRequest('ticket الزامی است');

    const settings = await getPaymentSettings(strapi);
    if (settings.mockMode || !settings.enabled) {
      ctx.body = { ok: true, mock: true, message: 'بازگشت وجه شبیه‌سازی شد' };
      return;
    }
    try {
      const token = await getAccessToken(settings);
      const base = (settings.baseUrl || '').replace(/\/$/, '');
      const res = await fetch(`${base}/digipay/api/refunds`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket,
          amount: tomanToRial(Number(amountToman) || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      ctx.body = { ok: res.ok, data };
    } catch (e: any) {
      return ctx.badRequest(e.message || 'خطای بازگشت وجه');
    }
  },
};
