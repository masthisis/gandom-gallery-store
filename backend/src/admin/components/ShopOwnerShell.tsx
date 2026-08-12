import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@strapi/strapi/admin';

const SHOP_OWNER_CODE = 'shop-owner';
const SUPER_ADMIN_CODE = 'strapi-super-admin';
const DASHBOARD_PATH = '/plugins/gandom-shop';

const BLOCKED_PREFIXES = [
  '/settings',
  '/plugins/content-type-builder',
  '/marketplace',
  '/plugins/cloud',
  '/plugins/strapi-cloud',
  '/plugins/chartbrew',
  '/plugins/deploy',
  '/plugins/email',
  '/plugins/documentation',
];

const HIDE_NAV_HREFS = [
  '/admin/settings',
  '/admin/plugins/content-type-builder',
  '/admin/marketplace',
  '/admin/plugins/cloud',
  '/admin/plugins/strapi-cloud',
  '/admin/plugins/chartbrew',
  '/admin/plugins/deploy',
  '/admin/plugins/email',
  '/admin/plugins/documentation',
  '/admin/plugins/review-workflows',
  '/admin/list-plugins',
];

function isShopOwnerOnly(roles: Array<{ code?: string }> | undefined) {
  const codes = (roles || []).map((r) => r.code).filter(Boolean) as string[];
  return codes.includes(SHOP_OWNER_CODE) && !codes.includes(SUPER_ADMIN_CODE);
}

function applyNavFilter(root: ParentNode) {
  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!HIDE_NAV_HREFS.some((blocked) => href.includes(blocked))) return;
    const item = link.closest('li') || link.closest('[role="menuitem"]') || link.parentElement;
    if (item instanceof HTMLElement) {
      item.style.display = 'none';
    }
  });
}

function hideHomeAdminWidgets(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('h2, h3').forEach((heading) => {
    const label = heading.textContent?.trim() || '';
    if (
      label === 'Project statistics' ||
      label === 'Deploy' ||
      label === 'Last activity' ||
      label.includes('آمار') ||
      label.includes('استقرار')
    ) {
      const card = heading.closest('section') || heading.closest('[data-strapi-widget]') || heading.parentElement?.parentElement;
      if (card instanceof HTMLElement) card.style.display = 'none';
    }
  });

  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (
      href.includes('/settings/') ||
      href.includes('content-type-builder') ||
      href.includes('/marketplace') ||
      href.includes('api-tokens') ||
      href.includes('webhooks')
    ) {
      const card = link.closest('section') || link.closest('[data-strapi-widget]') || link.parentElement?.parentElement;
      if (card instanceof HTMLElement) card.style.display = 'none';
    }
  });
}

const ShopOwnerShell = () => {
  const user = useAuth('ShopOwnerShell', (state) => state.user);
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);

  const shopOwnerOnly = isShopOwnerOnly(user?.roles);

  useEffect(() => {
    if (!shopOwnerOnly) return;

    if (typeof window !== 'undefined' && window.localStorage.getItem('strapi-admin-language') !== 'fa') {
      window.localStorage.setItem('strapi-admin-language', 'fa');
      window.location.reload();
    }
  }, [shopOwnerOnly]);

  useEffect(() => {
    if (!shopOwnerOnly) return undefined;

    applyNavFilter(document.body);
    hideHomeAdminWidgets(document.body);
    observerRef.current = new MutationObserver(() => {
      applyNavFilter(document.body);
      hideHomeAdminWidgets(document.body);
    });
    observerRef.current.observe(document.body, { childList: true, subtree: true });

    return () => observerRef.current?.disconnect();
  }, [shopOwnerOnly]);

  useEffect(() => {
    if (!shopOwnerOnly) return;

    const path = location.pathname.replace(/\/admin\/?/, '/') || '/';
    const normalized = path.startsWith('/') ? path : `/${path}`;

    if (normalized === '/' || normalized === '') {
      window.location.replace('/admin/plugins/gandom-shop');
      return;
    }

    if (BLOCKED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
      window.location.replace('/admin/plugins/gandom-shop');
    }
  }, [shopOwnerOnly, location.pathname]);

  return null;
};

export function ShopOwnerInitializer({
  setPlugin,
}: {
  setPlugin: (_pluginId: string) => void;
}) {
  useEffect(() => {
    setPlugin('gandom-shop-owner-ui');
  }, [setPlugin]);

  return <ShopOwnerShell />;
}

export default ShopOwnerShell;
