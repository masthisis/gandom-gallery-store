'use strict';

module.exports = {
  async list(ctx) {
    const data = await strapi.plugin('gandom-shop').service('category').list(ctx.query);
    ctx.body = { data };
  },

  async parentOptions(ctx) {
    const data = await strapi.plugin('gandom-shop').service('category').parentOptions();
    ctx.body = { data };
  },

  async findOne(ctx) {
    const data = await strapi.plugin('gandom-shop').service('category').findOne(ctx.params.id);
    if (!data) return ctx.notFound('دسته‌بندی یافت نشد');
    ctx.body = { data };
  },

  async create(ctx) {
    const data = await strapi.plugin('gandom-shop').service('category').create(ctx.request.body || {});
    ctx.body = { data };
  },

  async update(ctx) {
    const data = await strapi
      .plugin('gandom-shop')
      .service('category')
      .update(ctx.params.id, ctx.request.body || {});
    if (!data) return ctx.notFound('دسته‌بندی یافت نشد');
    ctx.body = { data };
  },

  async remove(ctx) {
    const ok = await strapi.plugin('gandom-shop').service('category').remove(ctx.params.id);
    if (!ok) return ctx.notFound('دسته‌بندی یافت نشد');
    ctx.body = { ok: true };
  },
};
