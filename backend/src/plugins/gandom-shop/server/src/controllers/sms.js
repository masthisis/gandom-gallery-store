'use strict';

module.exports = {
  async getSettings(ctx) {
    const data = await strapi.plugin('gandom-shop').service('sms').getSettings();
    ctx.body = { data };
  },

  async updateSettings(ctx) {
    const data = await strapi.plugin('gandom-shop').service('sms').updateSettings(ctx.request.body);
    ctx.body = { data };
  },

  async testConnection(ctx) {
    const { mobile } = ctx.request.body || {};
    const result = await strapi.plugin('gandom-shop').service('sms').testConnection({ mobile });
    ctx.body = result;
  },

  async testEvent(ctx) {
    const { event, mobile } = ctx.request.body || {};
    const result = await strapi.plugin('gandom-shop').service('sms').testEvent({ event, mobile });
    ctx.body = result;
  },

  async testAll(ctx) {
    const { mobile } = ctx.request.body || {};
    const result = await strapi.plugin('gandom-shop').service('sms').testAll({ mobile });
    ctx.body = result;
  },

  async goLiveChecklist(ctx) {
    const data = await strapi.plugin('gandom-shop').service('sms').getGoLiveChecklist();
    ctx.body = { data };
  },
};
