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
};
