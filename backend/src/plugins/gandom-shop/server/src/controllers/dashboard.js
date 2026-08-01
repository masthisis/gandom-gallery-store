'use strict';

module.exports = {
  async overview(ctx) {
    const data = await strapi.plugin('gandom-shop').service('dashboard').overview();
    ctx.body = { data };
  },

  async pendingComments(ctx) {
    const data = await strapi.plugin('gandom-shop').service('dashboard').pendingComments();
    ctx.body = { data };
  },

  async approveComment(ctx) {
    const id = ctx.params.id;
    const updated = await strapi
      .plugin('gandom-shop')
      .service('dashboard')
      .setCommentVisibility(id, true);
    ctx.body = { data: { id: updated.id, is_visible: true } };
  },

  async rejectComment(ctx) {
    const id = ctx.params.id;
    await strapi.plugin('gandom-shop').service('dashboard').deleteComment(id);
    ctx.body = { ok: true };
  },

  async customers(ctx) {
    const data = await strapi.plugin('gandom-shop').service('dashboard').customers();
    ctx.body = { data };
  },

  async testEmail(ctx) {
    const mail = strapi.gandomMail;
    if (!mail) return ctx.badRequest('سرویس ایمیل آماده نیست');
    const settings = await strapi.documents('api::notification-setting.notification-setting').findFirst({});
    const to = ctx.request.body?.to || settings?.adminEmail;
    if (!to) {
      return ctx.badRequest('آدرس ایمیل اعلان تنظیم نشده است');
    }
    if (!mail.isMailConfigured()) {
      return ctx.badRequest('متغیرهای MAIL_* لیارا تنظیم نشده‌اند');
    }
    const result = await mail.sendMail({
      to,
      subject: '[گندم گالری] ایمیل آزمایشی اعلان‌ها',
      text: 'این یک ایمیل آزمایشی از پنل گندم گالری است. اگر آن را دریافت کردید، SMTP لیارا درست کار می‌کند.',
      tag: 'test_email',
    });
    if (!result.ok) return ctx.badRequest(result.error || 'ارسال ناموفق');
    ctx.body = { ok: true, to };
  },
};
