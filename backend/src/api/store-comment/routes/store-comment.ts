/**
 * Core router — Content Manager uses this; public storefront uses product-comment API
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::store-comment.store-comment');
