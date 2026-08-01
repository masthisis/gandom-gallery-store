/**
 * Admin CRUD for store comments (approve via is_visible)
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::store-comment.store-comment');
