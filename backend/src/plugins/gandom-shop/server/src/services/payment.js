'use strict';

const path = require('path');

function parseGatewayMeta(tx) {
  const g = tx?.gateway_response || {};
  const mock =
    g.mock === true ||
    String(tx?.transaction_id || '').startsWith('MOCK-') ||
    g.mock === 1;
  return {
    providerId: g.providerId || null,
    userId: g.userId || null,
    mock,
  };
}

async function findOrderForProvider(strapi, providerId) {
  if (!providerId) return null;
  let order =
    (await strapi.db.query('plugin::webbycommerce.order').findOne({
      where: { order_number: providerId },
      populate: ['user'],
    })) ||
    (await strapi.db.query('plugin::webbycommerce.order').findOne({
      where: { id: Number(providerId) || 0 },
      populate: ['user'],
    }));
  if (!order) {
    try {
      order = await strapi.documents('plugin::webbycommerce.order').findOne({
        documentId: providerId,
        populate: ['user'],
      });
    } catch {
      /* ignore */
    }
  }
  return order;
}

module.exports = ({ strapi }) => {
  const {
    getPaymentSettings,
    updatePaymentSettings,
    maskPaymentSettings,
    testDigipayConnection,
    getAccessToken,
    tomanToRial,
    clearDigipayTokenCache,
  } = require(path.join(strapi.dirs.app.root, 'src/utils/payment-settings.js'));

  return {
  async getSettings() {
    const settings = await getPaymentSettings(strapi);
    return maskPaymentSettings(settings);
  },

  async updateSettings(input) {
    const updated = await updatePaymentSettings(strapi, input || {});
    return maskPaymentSettings(updated);
  },

  async testConnection() {
    const settings = await getPaymentSettings(strapi);
    return testDigipayConnection(settings);
  },

  async getGoLiveChecklist() {
    const settings = await getPaymentSettings(strapi);
    const masked = maskPaymentSettings(settings);
    const storefrontCallback =
      process.env.DIGIPAY_CALLBACK_URL || 'http://localhost:5173/payment/callback';
    const connection = await testDigipayConnection(settings);
    return {
      mockOff: !settings.mockMode,
      enabledOn: !!settings.enabled,
      callbackMatchesStorefront:
        masked.callbackUrl === storefrontCallback ||
        masked.callbackUrl.replace(/\/$/, '') === storefrontCallback.replace(/\/$/, ''),
      hasCredentials:
        settings.clientId && settings.clientSecret && settings.username && settings.password,
      connectionOk: connection.ok,
      isProduction: process.env.NODE_ENV === 'production',
    };
  },

  async listPayments({ status, mock, search, page = 1, pageSize = 25 } = {}) {
    const limit = Math.min(Number(pageSize) || 25, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

    const rows = await strapi.db.query('plugin::webbycommerce.payment-transaction').findMany({
      orderBy: { id: 'desc' },
      limit: 500,
    });

    let list = (rows || []).map((tx) => {
      const meta = parseGatewayMeta(tx);
      return {
        id: tx.id,
        documentId: tx.documentId,
        transaction_id: tx.transaction_id,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt,
        providerId: meta.providerId,
        userId: meta.userId,
        mock: meta.mock,
        gateway_response: tx.gateway_response,
      };
    });

    if (status) {
      list = list.filter((r) => String(r.status) === String(status));
    }
    if (mock === 'true' || mock === true) {
      list = list.filter((r) => r.mock);
    } else if (mock === 'false' || mock === false) {
      list = list.filter((r) => !r.mock);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (r) =>
          String(r.transaction_id || '').toLowerCase().includes(q) ||
          String(r.providerId || '').toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const pageRows = list.slice(offset, offset + limit);

    const enriched = [];
    for (const row of pageRows) {
      const order = await findOrderForProvider(strapi, row.providerId);
      enriched.push({
        ...row,
        order: order
          ? {
              id: order.id,
              documentId: order.documentId,
              order_number: order.order_number,
              payment_status: order.payment_status,
              total: order.total,
              user: order.user
                ? {
                    id: order.user.id,
                    phone_no: order.user.phone_no,
                    display_name: order.user.display_name,
                  }
                : null,
            }
          : null,
      });
    }

    return { data: enriched, meta: { total, page: Number(page) || 1, pageSize: limit } };
  },

  async getPayment(id) {
    const tx = await strapi.db.query('plugin::webbycommerce.payment-transaction').findOne({
      where: { id: Number(id) },
    });
    if (!tx) return null;
    const meta = parseGatewayMeta(tx);
    const order = await findOrderForProvider(strapi, meta.providerId);
    return {
      id: tx.id,
      documentId: tx.documentId,
      transaction_id: tx.transaction_id,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      providerId: meta.providerId,
      userId: meta.userId,
      mock: meta.mock,
      gateway_response: tx.gateway_response,
      order: order
        ? {
            id: order.id,
            documentId: order.documentId,
            order_number: order.order_number,
            payment_status: order.payment_status,
            status: order.status,
            total: order.total,
            user: order.user
              ? {
                  id: order.user.id,
                  phone_no: order.user.phone_no,
                  display_name: order.user.display_name,
                }
              : null,
          }
        : null,
    };
  },

  async refundPayment(id, amountToman) {
    const tx = await strapi.db.query('plugin::webbycommerce.payment-transaction').findOne({
      where: { id: Number(id) },
    });
    if (!tx) return { ok: false, error: 'تراکنش پیدا نشد' };

    const ticket = tx.transaction_id;
    const settings = await getPaymentSettings(strapi);
    const meta = parseGatewayMeta(tx);

    if (meta.mock || settings.mockMode || !settings.enabled) {
      await strapi.db.query('plugin::webbycommerce.payment-transaction').update({
        where: { id: tx.id },
        data: {
          status: 'refunded',
          gateway_response: { ...(tx.gateway_response || {}), refund: { mock: true } },
        },
      });
      const order = await findOrderForProvider(strapi, meta.providerId);
      if (order) {
        await strapi.db.query('plugin::webbycommerce.order').update({
          where: { id: order.id },
          data: { payment_status: 'refunded', status: 'refunded' },
        });
      }
      return { ok: true, mock: true, message: 'بازگشت وجه شبیه‌سازی شد' };
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
          amount: tomanToRial(Number(amountToman) || Number(tx.amount) || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: 'بازگشت وجه ناموفق بود', data };
      }

      await strapi.db.query('plugin::webbycommerce.payment-transaction').update({
        where: { id: tx.id },
        data: {
          status: 'refunded',
          gateway_response: { ...(tx.gateway_response || {}), refund: data },
        },
      });
      const order = await findOrderForProvider(strapi, meta.providerId);
      if (order) {
        await strapi.db.query('plugin::webbycommerce.order').update({
          where: { id: order.id },
          data: { payment_status: 'refunded', status: 'refunded' },
        });
      }
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err?.message || 'خطای بازگشت وجه' };
    }
  },

  async writeReconcileLog({ orderId, orderNumber, action, reason, admin }) {
    try {
      await strapi.documents('api::payment-reconcile-log.payment-reconcile-log').create({
        data: {
          orderId: Number(orderId),
          orderNumber: orderNumber || null,
          action,
          reason,
          adminEmail: admin?.email || null,
          adminId: admin?.id || null,
          metadata: { at: new Date().toISOString() },
        },
      });
    } catch (e) {
      strapi.log.warn('[gandom-shop] reconcile log failed', e);
    }
  },

  async markOrderPaid(orderId, reason, admin) {
    const order = await strapi.db.query('plugin::webbycommerce.order').findOne({
      where: { id: Number(orderId) },
    });
    if (!order) return { ok: false, error: 'سفارش پیدا نشد' };

    await strapi.db.query('plugin::webbycommerce.order').update({
      where: { id: order.id },
      data: {
        payment_status: 'paid',
        status: order.status === 'pending' ? 'processing' : order.status,
      },
    });

    const txs = await strapi.db.query('plugin::webbycommerce.payment-transaction').findMany({
      limit: 50,
      orderBy: { id: 'desc' },
    });
    const match = (txs || []).find(
      (t) =>
        t.gateway_response?.providerId === order.order_number ||
        t.gateway_response?.providerId === String(order.documentId) ||
        t.gateway_response?.providerId === String(order.id)
    );
    if (match) {
      await strapi.db.query('plugin::webbycommerce.payment-transaction').update({
        where: { id: match.id },
        data: {
          status: 'completed',
          gateway_response: {
            ...(match.gateway_response || {}),
            reconcile: { action: 'mark_paid', reason, at: new Date().toISOString() },
          },
        },
      });
    }

    await this.writeReconcileLog({
      orderId: order.id,
      orderNumber: order.order_number,
      action: 'mark_paid',
      reason,
      admin,
    });

    return { ok: true, orderId: order.id };
  },

  async markOrderFailed(orderId, reason, admin) {
    const order = await strapi.db.query('plugin::webbycommerce.order').findOne({
      where: { id: Number(orderId) },
    });
    if (!order) return { ok: false, error: 'سفارش پیدا نشد' };

    await strapi.db.query('plugin::webbycommerce.order').update({
      where: { id: order.id },
      data: { payment_status: 'failed' },
    });

    const txs = await strapi.db.query('plugin::webbycommerce.payment-transaction').findMany({
      limit: 50,
      orderBy: { id: 'desc' },
    });
    const match = (txs || []).find(
      (t) =>
        t.gateway_response?.providerId === order.order_number ||
        t.gateway_response?.providerId === String(order.documentId) ||
        t.gateway_response?.providerId === String(order.id)
    );
    if (match) {
      await strapi.db.query('plugin::webbycommerce.payment-transaction').update({
        where: { id: match.id },
        data: {
          status: 'failed',
          gateway_response: {
            ...(match.gateway_response || {}),
            reconcile: { action: 'mark_failed', reason, at: new Date().toISOString() },
          },
        },
      });
    }

    await this.writeReconcileLog({
      orderId: order.id,
      orderNumber: order.order_number,
      action: 'mark_failed',
      reason,
      admin,
    });

    return { ok: true, orderId: order.id };
  },

  clearTokenCache() {
    clearDigipayTokenCache();
  },
  };
};
