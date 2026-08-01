/**
 * Shared JWT user resolver for custom auth:false routes that still accept Bearer tokens
 */

export async function resolveUser(ctx: any, strapi: any) {
  const auth = ctx.request.header.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const payload = await strapi.plugin('users-permissions').service('jwt').verify(auth.slice(7));
    return strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: payload.id } });
  } catch {
    return null;
  }
}
