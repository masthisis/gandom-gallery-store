import { ChartBubble, Message, User } from '@strapi/icons';
import { PLUGIN_ID } from './pluginId';

const PluginIcon = () => <ChartBubble />;
const CommentsIcon = () => <Message />;
const CustomersIcon = () => <User />;

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.dashboard`,
        defaultMessage: 'داشبورد فروشگاه',
      },
      Component: () => import('./pages/DashboardPage'),
      permissions: [],
      position: 1,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/comments`,
      icon: CommentsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.comments`,
        defaultMessage: 'دیدگاه‌های در انتظار',
      },
      Component: () => import('./pages/CommentsPage'),
      permissions: [],
      position: 2,
    });

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}/customers`,
      icon: CustomersIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menu.customers`,
        defaultMessage: 'مشتریان',
      },
      Component: () => import('./pages/CustomersPage'),
      permissions: [],
      position: 3,
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
