export default {
  routes: [
    {
      method: 'POST',
      path: '/digipay/ticket',
      handler: 'digipay.createTicket',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/digipay/callback',
      handler: 'digipay.callback',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/digipay/callback',
      handler: 'digipay.callback',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/digipay/refund',
      handler: 'digipay.refund',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
