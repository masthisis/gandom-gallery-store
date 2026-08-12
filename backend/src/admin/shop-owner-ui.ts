import type { StrapiApp } from '@strapi/strapi/admin';

const SHOP_OWNER_CODE = 'shop-owner';
const SUPER_ADMIN_CODE = 'strapi-super-admin';

/** Content Manager UIDs the shop owner may see (shop operations only). */
export const SHOP_OWNER_CM_UIDS = new Set([
  'plugin::webbycommerce.product',
  'plugin::webbycommerce.order',
  'plugin::webbycommerce.coupon',
  'plugin::webbycommerce.product-review',
  'api::nav-category.nav-category',
  'api::store-comment.store-comment',
  'api::homepage.homepage',
  'api::page.page',
  'api::store-setting.store-setting',
]);

type CmLink = { uid?: string };

function isShopOwnerSession(store: { getState: () => unknown } | undefined) {
  if (!store) return false;
  const state = store.getState() as {
    auth?: { user?: { roles?: Array<{ code?: string }> } };
  };
  const roles = state.auth?.user?.roles || [];
  const codes = roles.map((r) => r.code).filter(Boolean) as string[];
  return codes.includes(SHOP_OWNER_CODE) && !codes.includes(SUPER_ADMIN_CODE);
}

function filterCmLinks(links: CmLink[], store: { getState: () => unknown } | undefined) {
  if (!isShopOwnerSession(store)) return links;
  return links.filter((link) => link.uid && SHOP_OWNER_CM_UIDS.has(link.uid));
}

export function configureShopOwnerAdminUi(app: StrapiApp) {
  app.registerHook('Admin/CM/pages/App/mutate-collection-types-links', (links, store) =>
    filterCmLinks(links as CmLink[], store as { getState: () => unknown })
  );

  app.registerHook('Admin/CM/pages/App/mutate-single-types-links', (links, store) =>
    filterCmLinks(links as CmLink[], store as { getState: () => unknown })
  );
}
