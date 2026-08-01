import type { StrapiApp } from '@strapi/strapi/admin';
import fa from './extensions/translations/fa.json';

export default {
  config: {
    locales: ['fa', 'en'],
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
  bootstrap(_app: StrapiApp) {
    // Shop Owner should pick فارسی in profile → Experience → Interface language
  },
};
