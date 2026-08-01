export default {
  routes: [
    {
      method: 'GET',
      path: '/category-tree',
      handler: 'category-tree.tree',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
