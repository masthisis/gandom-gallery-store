const SUPER_ADMIN_CODE = 'strapi-super-admin';
const SHOP_OWNER_CODE = 'shop-owner';
const DASHBOARD = '/admin/plugins/gandom-shop';

const BLOCKED_PATHS = [
  /^\/admin\/?$/,
  /^\/admin\/settings(?:\/|$)/,
  /^\/admin\/plugins\/content-type-builder(?:\/|$)/,
  /^\/admin\/marketplace(?:\/|$)/,
  /^\/admin\/plugins\/cloud(?:\/|$)/,
  /^\/admin\/plugins\/strapi-cloud(?:\/|$)/,
  /^\/admin\/plugins\/chartbrew(?:\/|$)/,
  /^\/admin\/plugins\/deploy(?:\/|$)/,
  /^\/admin\/list-plugins(?:\/|$)/,
];

function readToken() {
  try {
    const raw = window.localStorage.getItem('jwtToken');
    if (!raw) return null;
    return JSON.parse(raw) as string;
  } catch {
    return null;
  }
}

function isBlockedPath(pathname: string) {
  return BLOCKED_PATHS.some((pattern) => pattern.test(pathname));
}

async function shouldRedirectShopOwner() {
  const token = readToken();
  if (!token) return false;

  const response = await fetch('/admin/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return false;

  const payload = await response.json();
  const roles = (payload?.data?.roles || []) as Array<{ code?: string }>;
  const codes = roles.map((role) => role.code).filter(Boolean) as string[];
  return codes.includes(SHOP_OWNER_CODE) && !codes.includes(SUPER_ADMIN_CODE);
}

async function enforceShopOwnerRouteGuard() {
  if (!isBlockedPath(window.location.pathname)) return;
  try {
    if (await shouldRedirectShopOwner()) {
      window.location.replace(DASHBOARD);
    }
  } catch {
    /* ignore guard failures */
  }
}

function installHistoryGuard() {
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<History['pushState']>) => {
    originalPushState(...args);
    void enforceShopOwnerRouteGuard();
  };

  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplaceState(...args);
    void enforceShopOwnerRouteGuard();
  };

  window.addEventListener('popstate', () => {
    void enforceShopOwnerRouteGuard();
  });
}

if (typeof window !== 'undefined') {
  void enforceShopOwnerRouteGuard();
  installHistoryGuard();
}
