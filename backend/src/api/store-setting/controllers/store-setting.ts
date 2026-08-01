import { factories } from '@strapi/strapi';
import { mediaUrl } from '../../../utils/media-url';

export default factories.createCoreController('api::store-setting.store-setting', ({ strapi }) => ({
  async find(ctx) {
    const entity = await strapi.documents('api::store-setting.store-setting').findFirst({
      populate: ['logo'],
    });

    if (!entity) {
      return { data: null };
    }

    const data = entity as Record<string, unknown>;
    return {
      data: {
        ...data,
        logoUrl: mediaUrl(data.logo),
      },
    };
  },
}));
