/**
 * Custom favorites routes (JWT resolved manually; auth:false for users-permissions friction)
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/favorites',
      handler: 'favorite.list',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/favorites/status',
      handler: 'favorite.status',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/favorites',
      handler: 'favorite.add',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/favorites/toggle',
      handler: 'favorite.toggle',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/favorites/:product',
      handler: 'favorite.remove',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
