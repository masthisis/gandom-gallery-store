export default {
  routes: [
    {
      method: 'GET',
      path: '/iran-geo',
      handler: 'iran-geo.list',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/iran-geo/province/:name',
      handler: 'iran-geo.province',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
