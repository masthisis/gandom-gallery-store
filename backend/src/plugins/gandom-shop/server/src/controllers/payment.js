'use strict';

module.exports = {
  async getSettings(ctx) {
    const data = await strapi.plugin('gandom-shop').service('payment').getSettings();
    ctx.body = { data };
  },

  async updateSettings(ctx) {
    const data = await strapi.plugin('gandom-shop').service('payment').updateSettings(ctx.request.body);
    ctx.body = { data };
  },

  async testConnection(ctx) {
    const result = await strapi.plugin('gandom-shop').service('payment').testConnection();
    ctx.body = result;
  },

  async goLiveChecklist(ctx) {
    const data = await strapi.plugin('gandom-shop').service('payment').getGoLiveChecklist();
    ctx.body = { data };
  },

  async listPayments(ctx) {
    const { status, mock, search, page, pageSize } = ctx.query || {};
    const result = await strapi.plugin('gandom-shop').service('payment').listPayments({
      status,
      mock,
      search,
      page,
      pageSize,
    });
    ctx.body = result;
  },

  async getPayment(ctx) {
    const data = await strapi.plugin('gandom-shop').service('payment').getPayment(ctx.params.id);
    if (!data) return ctx.notFound('پرداخت پیدا نشد');
    ctx.body = { data };
  },

  async refundPayment(ctx) {
    const { amountToman } = ctx.request.body || {};
    const result = await strapi.plugin('gandom-shop').service('payment').refundPayment(
      ctx.params.id,
      amountToman
    );
    if (!result.ok) return ctx.badRequest(result.error || 'بازگشت وجه ناموفق');
    ctx.body = result;
  },

  async markOrderPaid(ctx) {
    const { reason } = ctx.request.body || {};
    if (!reason || String(reason).trim().length < 3) {
      return ctx.badRequest('دلیل الزامی است');
    }
    const admin = ctx.state.user;
    const result = await strapi.plugin('gandom-shop').service('payment').markOrderPaid(
      ctx.params.id,
      String(reason).trim(),
      admin
    );
    if (!result.ok) return ctx.badRequest(result.error || 'خطا');
    ctx.body = result;
  },

  async markOrderFailed(ctx) {
    const { reason } = ctx.request.body || {};
    if (!reason || String(reason).trim().length < 3) {
      return ctx.badRequest('دلیل الزامی است');
    }
    const admin = ctx.state.user;
    const result = await strapi.plugin('gandom-shop').service('payment').markOrderFailed(
      ctx.params.id,
      String(reason).trim(),
      admin
    );
    if (!result.ok) return ctx.badRequest(result.error || 'خطا');
    ctx.body = result;
  },

  async testPaymentNotification(ctx) {
    const event = ctx.request.body?.event;
    if (event !== 'order_paid' && event !== 'payment_failed') {
      return ctx.badRequest('event نامعتبر است');
    }
    const mobile = ctx.request.body?.mobile;
    const result = await strapi.plugin('gandom-shop').service('sms').testEvent({ event, mobile });
    if (!result.ok) return ctx.badRequest(result.error || 'ارسال ناموفق');
    ctx.body = { ok: true, event, result };
  },
};
