'use strict';

module.exports = {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/overview',
        handler: 'dashboard.overview',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'GET',
        path: '/pending-comments',
        handler: 'dashboard.pendingComments',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'POST',
        path: '/pending-comments/:id/approve',
        handler: 'dashboard.approveComment',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'POST',
        path: '/pending-comments/:id/reject',
        handler: 'dashboard.rejectComment',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'GET',
        path: '/customers',
        handler: 'dashboard.customers',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
    ],
  },
};
