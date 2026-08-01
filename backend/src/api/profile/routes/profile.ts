export default {
  routes: [
    {
      method: 'GET',
      path: '/profile/me',
      handler: 'profile.me',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/profile/me',
      handler: 'profile.updateMe',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/profile/addresses',
      handler: 'profile.createAddress',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/profile/addresses/:id',
      handler: 'profile.updateAddress',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/profile/addresses/:id',
      handler: 'profile.deleteAddress',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/profile/save-from-checkout',
      handler: 'profile.saveFromCheckout',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
