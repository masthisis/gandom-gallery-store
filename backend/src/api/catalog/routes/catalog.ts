export default {
  routes: [
    {
      method: 'GET',
      path: '/catalog/product-metas',
      handler: 'catalog.list',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
