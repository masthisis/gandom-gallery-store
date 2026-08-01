export default {
  routes: [
    {
      method: 'GET',
      path: '/product-comments',
      handler: 'product-comment.list',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/product-comments',
      handler: 'product-comment.create',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
