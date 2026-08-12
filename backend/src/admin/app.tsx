import type { StrapiApp } from '@strapi/strapi/admin';
import { User } from '@strapi/icons';
import './shop-owner-guard';
import fa from './extensions/translations/fa.json';
import ShopOwnerShell from './components/ShopOwnerShell';
import { configureShopOwnerAdminUi } from './shop-owner-ui';

export default {
  config: {
    locales: ['fa', 'en'],
    tutorials: false,
    notifications: { releases: false },
    languageNativeNames: {
      fa: 'فارسی',
    },
    translations: {
      fa,
      en: {
        'app.components.LeftMenu.navbrand.title': 'Gandom Gallery',
        'app.components.LeftMenu.navbrand.workplace': 'Shop admin',
      },
    },
  },

  register(app: StrapiApp) {
    app.widgets.register({
      icon: User,
      title: {
        id: 'gandom.shop-owner.shell',
        defaultMessage: ' ',
      },
      component: async () => ShopOwnerShell,
      pluginId: 'admin',
      id: 'shop-owner-shell',
      roles: ['shop-owner'],
    });

    app.registerPlugin({
      id: 'gandom-shop-owner-ui',
      name: 'Gandom Shop Owner UI',
      isReady: true,
    });
  },

  bootstrap(app: StrapiApp) {
    configureShopOwnerAdminUi(app);

    const cm = app.getPlugin('content-manager');
    for (const zone of ['listView', 'editView', 'preview'] as const) {
      cm?.injectComponent(zone, 'actions', {
        name: 'gandom-shop-owner-shell',
        Component: ShopOwnerShell,
      });
    }
  },
};
