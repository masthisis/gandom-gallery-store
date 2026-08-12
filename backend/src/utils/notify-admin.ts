/**
 * @deprecated Alias — loads notify-sms from src/ at runtime (not dist/)
 */
import path from 'path';

export type NotificationEvent =
  | 'auth_otp'
  | 'low_stock'
  | 'payment_failed'
  | 'order_paid'
  | 'pending_comment';

function loadNotifySms(strapi: any) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(path.join(strapi.dirs.app.root, 'src/utils/notify-sms.js'));
}

export async function notifyAdmin(
  strapi: any,
  event: NotificationEvent | string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  return loadNotifySms(strapi).notifySms(strapi, event, payload);
}
