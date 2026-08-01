export default {
  routes: [
    {
      method: 'POST',
      path: '/auth-otp/request',
      handler: 'auth-otp.request',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/auth-otp/verify',
      handler: 'auth-otp.verify',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
