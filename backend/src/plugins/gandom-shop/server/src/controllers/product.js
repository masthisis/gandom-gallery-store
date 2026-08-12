'use strict';

module.exports = {
  async list(ctx) {
    const data = await strapi.plugin('gandom-shop').service('product').list(ctx.query);
    ctx.body = { data };
  },

  async findOne(ctx) {
    const data = await strapi.plugin('gandom-shop').service('product').findOne(ctx.params.id);
    if (!data) return ctx.notFound('محصول یافت نشد');
    ctx.body = { data };
  },

  async create(ctx) {
    const data = await strapi.plugin('gandom-shop').service('product').create(ctx.request.body || {});
    ctx.body = { data };
  },

  async update(ctx) {
    const data = await strapi.plugin('gandom-shop').service('product').update(ctx.params.id, ctx.request.body || {});
    if (!data) return ctx.notFound('محصول یافت نشد');
    ctx.body = { data };
  },

  async remove(ctx) {
    const ok = await strapi.plugin('gandom-shop').service('product').remove(ctx.params.id);
    if (!ok) return ctx.notFound('محصول یافت نشد');
    ctx.body = { ok: true };
  },

  async publish(ctx) {
    const { publish } = ctx.request.body || {};
    const data = await strapi
      .plugin('gandom-shop')
      .service('product')
      .setPublished(ctx.params.id, publish !== false);
    if (!data) return ctx.notFound('محصول یافت نشد');
    ctx.body = { data };
  },

  async categoryOptions(ctx) {
    const data = await strapi.plugin('gandom-shop').service('product').categoryOptions();
    ctx.body = { data };
  },
};
