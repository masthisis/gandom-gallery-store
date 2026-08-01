/**
 * Extensible admin email notifications (Liara SMTP).
 * Add new events in NOTIFICATION_EVENTS + toggle field / extraEventToggles.
 */

import { isMailConfigured, sendMail } from './mailer';

export type NotificationEvent =
  | 'low_stock'
  | 'payment_failed'
  | 'order_paid'
  | 'pending_comment';

type NotifyPayload = Record<string, unknown>;

const EVENT_TOGGLE: Record<NotificationEvent, keyof NotificationSettingsView> = {
  low_stock: 'notifyLowStock',
  payment_failed: 'notifyPaymentFailed',
  order_paid: 'notifyOrderPaid',
  pending_comment: 'notifyPendingComment',
};

type NotificationSettingsView = {
  enabled?: boolean;
  adminEmail?: string;
  notifyLowStock?: boolean;
  notifyPaymentFailed?: boolean;
  notifyOrderPaid?: boolean;
  notifyPendingComment?: boolean;
  extraEventToggles?: Record<string, boolean>;
};

async function getSettings(strapi: any): Promise<NotificationSettingsView | null> {
  try {
    return (await strapi.documents('api::notification-setting.notification-setting').findFirst({})) || null;
  } catch {
    return null;
  }
}

function buildMessage(event: NotificationEvent, payload: NotifyPayload): { subject: string; text: string; tag: string } {
  switch (event) {
    case 'low_stock': {
      const name = String(payload.name || payload.slug || 'محصول');
      const qty = payload.stock_quantity;
      const threshold = payload.threshold;
      return {
        subject: `[گندم گالری] موجودی کم: ${name}`,
        text: [
          'هشدار موجودی کم',
          '',
          `محصول: ${name}`,
          `اسلاگ: ${payload.slug || '—'}`,
          `موجودی فعلی: ${qty}`,
          `آستانه: ${threshold}`,
          `SKU: ${payload.sku || '—'}`,
          '',
          'لطفاً موجودی را در پنل مدیریت به‌روز کنید.',
        ].join('\n'),
        tag: 'low_stock',
      };
    }
    case 'payment_failed': {
      return {
        subject: `[گندم گالری] پرداخت ناموفق`,
        text: [
          'پرداخت ناموفق بود',
          '',
          `شماره/شناسه سفارش: ${payload.providerId || payload.order_number || '—'}`,
          `تیکت: ${payload.ticket || '—'}`,
          `وضعیت درگاه: ${payload.status || 'failed'}`,
          `مبلغ (تومان): ${payload.amountToman ?? '—'}`,
          `کاربر: ${payload.userId || payload.phone || '—'}`,
          `زمان: ${payload.at || new Date().toISOString()}`,
          '',
          `جزئیات: ${JSON.stringify(payload.details || {}, null, 2)}`,
        ].join('\n'),
        tag: 'payment_failed',
      };
    }
    case 'order_paid': {
      return {
        subject: `[گندم گالری] سفارش پرداخت‌شده`,
        text: [
          'سفارش با موفقیت پرداخت شد',
          '',
          `سفارش: ${payload.providerId || payload.order_number || '—'}`,
          `مبلغ: ${payload.amountToman ?? '—'} تومان`,
          `تیکت: ${payload.ticket || '—'}`,
        ].join('\n'),
        tag: 'order_paid',
      };
    }
    case 'pending_comment': {
      return {
        subject: `[گندم گالری] دیدگاه جدید در انتظار تأیید`,
        text: [
          'دیدگاه جدید ثبت شد و نیاز به تأیید دارد',
          '',
          `محصول: ${payload.productSlug || '—'}`,
          `کاربر: ${payload.userName || payload.userId || '—'}`,
          `متن: ${payload.body || '—'}`,
        ].join('\n'),
        tag: 'pending_comment',
      };
    }
    default: {
      const e = String(event);
      return {
        subject: `[گندم گالری] اعلان: ${e}`,
        text: JSON.stringify(payload, null, 2),
        tag: e,
      };
    }
  }
}

function isEventEnabled(settings: NotificationSettingsView, event: NotificationEvent): boolean {
  const key = EVENT_TOGGLE[event];
  if (key && settings[key] === false) return false;
  if (key && settings[key] === true) return true;
  const extra = settings.extraEventToggles || {};
  if (typeof extra[event] === 'boolean') return extra[event];
  return false;
}

/**
 * Notify shop admin. Safe to call fire-and-forget; never throws to caller.
 */
export async function notifyAdmin(
  strapi: any,
  event: NotificationEvent | string,
  payload: NotifyPayload = {}
): Promise<void> {
  try {
    if (!isMailConfigured()) {
      strapi.log.debug('[notify] skip — MAIL_* not configured');
      return;
    }

    const settings = await getSettings(strapi);
    if (!settings?.enabled || !settings.adminEmail) {
      strapi.log.debug('[notify] skip — notifications disabled or no adminEmail');
      return;
    }

    const eventKey = event as NotificationEvent;
    if (!isEventEnabled(settings, eventKey) && !(settings.extraEventToggles || {})[String(event)]) {
      return;
    }

    // Allow future custom events via extraEventToggles only
    let message: { subject: string; text: string; tag: string };
    if (EVENT_TOGGLE[eventKey]) {
      message = buildMessage(eventKey, payload);
    } else if ((settings.extraEventToggles || {})[String(event)]) {
      message = {
        subject: `[گندم گالری] اعلان: ${event}`,
        text: JSON.stringify(payload, null, 2),
        tag: String(event),
      };
    } else {
      return;
    }

    const result = await sendMail({
      to: settings.adminEmail,
      subject: message.subject,
      text: message.text,
      tag: message.tag,
    });

    if (!result.ok) {
      strapi.log.warn('[notify] send failed', event, result.error);
    } else {
      strapi.log.info('[notify] sent', event, settings.adminEmail);
    }
  } catch (e) {
    strapi.log.warn('[notify] error', e);
  }
}
