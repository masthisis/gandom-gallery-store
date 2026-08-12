import React from 'react';
import { ChartBubble, Message, User, Cog, PriceTag, ShoppingCart, Folder } from '@strapi/icons';
import { PLUGIN_ID } from './pluginId';

function lazyPage(importer) {
  return async () => {
    const [{ default: Page }, { default: ShopOwnerShell }] = await Promise.all([
      importer(),
      import('./components/ShopOwnerShell'),
    ]);
    return () => (
      <>
        <ShopOwnerShell />
        <Page />
      </>
    );
  };
}

const PluginIcon = () => <ChartBubble />;
const CommentsIcon = () => <Message />;
const CustomersIcon = () => <User />;
const SettingsIcon = () => <Cog />;
const PaymentsIcon = () => <PriceTag />;
const SmsIcon = () => <Message />;
const ProductsIcon = () => <ShoppingCart />;
const CategoriesIcon = () => <Folder />;

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.dashboard`,
        defaultMessage: 'داشبورد فروشگاه',
      },
      Component: lazyPage(() => import('./pages/DashboardPage')),
      permissions: [],
      position: 1,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/products`,
      icon: ProductsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.products`,
        defaultMessage: 'محصولات',
      },
      Component: lazyPage(() => import('./pages/ProductsPage')),
      permissions: [],
      position: 2,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/categories`,
      icon: CategoriesIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.categories`,
        defaultMessage: 'دسته‌بندی‌ها',
      },
      Component: lazyPage(() => import('./pages/CategoriesPage')),
      permissions: [],
      position: 3,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/payment-settings`,
      icon: SettingsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.paymentSettings`,
        defaultMessage: 'تنظیمات درگاه',
      },
      Component: lazyPage(() => import('./pages/PaymentSettingsPage')),
      permissions: [],
      position: 4,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/sms-settings`,
      icon: SmsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.smsSettings`,
        defaultMessage: 'تنظیمات پیامک',
      },
      Component: lazyPage(() => import('./pages/SmsSettingsPage')),
      permissions: [],
      position: 5,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/payments`,
      icon: PaymentsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.payments`,
        defaultMessage: 'پرداخت‌ها',
      },
      Component: lazyPage(() => import('./pages/PaymentsPage')),
      permissions: [],
      position: 6,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/comments`,
      icon: CommentsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.comments`,
        defaultMessage: 'دیدگاه‌های در انتظار',
      },
      Component: lazyPage(() => import('./pages/CommentsPage')),
      permissions: [],
      position: 7,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/customers`,
      icon: CustomersIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.customers`,
        defaultMessage: 'مشتریان',
      },
      Component: lazyPage(() => import('./pages/CustomersPage')),
      permissions: [],
      position: 8,
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'فروشگاه گندم',
    });
  },

  bootstrap() {},

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
