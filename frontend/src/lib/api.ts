const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const WC_PREFIX = import.meta.env.VITE_WC_PREFIX || '/api/webbycommerce';

export function getToken(): string | null {
  return localStorage.getItem('gandom_jwt');
}

export function setToken(jwt: string | null) {
  if (jwt) localStorage.setItem('gandom_jwt', jwt);
  else localStorage.removeItem('gandom_jwt');
}

export function getGuestId(): string {
  let id = localStorage.getItem('gandom_guest_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('gandom_guest_id', id);
  }
  return id;
}

async function request<T = any>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || 'خطای سرور';
    throw new Error(typeof msg === 'string' ? msg : 'خطای سرور');
  }
  return data as T;
}

export const api = {
  homepage: () => request('/api/homepage', { auth: false }),
  categoryTree: () => request('/api/category-tree', { auth: false }),
  storeSettings: () => request('/api/store-setting', { auth: false }),
  pageBySlug: (slug: string) =>
    request(`/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&status=published`, {
      auth: false,
    }),
  pages: () => request('/api/pages?status=published', { auth: false }),

  otpRequest: (mobile: string) =>
    request('/api/auth-otp/request', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ mobile }),
    }),
  otpVerify: (mobile: string, otp: string) =>
    request('/api/auth-otp/verify', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ mobile, otp }),
    }),

  digipayTicket: (body: Record<string, unknown>) =>
    request('/api/digipay/ticket', { method: 'POST', body: JSON.stringify(body) }),
  digipayCallback: (query: string) => request(`/api/digipay/callback?${query}`, { auth: false }),

  iranGeo: () => request('/api/iran-geo', { auth: false }),
  iranProvince: (name: string) =>
    request(`/api/iran-geo/province/${encodeURIComponent(name)}`, { auth: false }),

  profileMe: () => request('/api/profile/me'),
  updateProfile: (body: Record<string, unknown>) =>
    request('/api/profile/me', { method: 'PUT', body: JSON.stringify(body) }),
  createProfileAddress: (body: Record<string, unknown>) =>
    request('/api/profile/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateProfileAddress: (id: string | number, body: Record<string, unknown>) =>
    request(`/api/profile/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProfileAddress: (id: string | number) =>
    request(`/api/profile/addresses/${id}`, { method: 'DELETE' }),
  saveFromCheckout: (body: Record<string, unknown>) =>
    request('/api/profile/save-from-checkout', { method: 'POST', body: JSON.stringify(body) }),

  favorites: () => request('/api/favorites'),
  favoriteStatus: (product: string) =>
    request(`/api/favorites/status?product=${encodeURIComponent(product)}`),
  toggleFavorite: (product: string) =>
    request('/api/favorites/toggle', { method: 'POST', body: JSON.stringify({ product }) }),
  removeFavorite: (product: string) =>
    request(`/api/favorites/${encodeURIComponent(product)}`, { method: 'DELETE' }),

  productMetas: () => request('/api/catalog/product-metas', { auth: false }),
  productMetaBySlug: (slug: string) =>
    request(`/api/catalog/product-metas?slug=${encodeURIComponent(slug)}`, { auth: false }),
  productComments: (product: string) =>
    request(`/api/product-comments?product=${encodeURIComponent(product)}`, { auth: false }),
  createProductComment: (body: {
    product: string;
    rating?: number;
    review: string;
    parentId?: number | string;
  }) => request('/api/product-comments', { method: 'POST', body: JSON.stringify(body) }),

  wc: {
    products: (params = '') =>
      request(`${WC_PREFIX}/products${params ? `?${params}` : ''}`, { auth: false }),
    product: (slug: string) => request(`${WC_PREFIX}/products/${slug}`, { auth: false }),
    categories: () => request(`${WC_PREFIX}/product-categories`, { auth: false }),
    cart: () =>
      request(`${WC_PREFIX}/cart?guest_id=${encodeURIComponent(getGuestId())}`),
    addToCart: (body: Record<string, unknown>) =>
      request(`${WC_PREFIX}/cart`, {
        method: 'POST',
        body: JSON.stringify({ ...body, guest_id: getGuestId(), currency: 'IRR' }),
      }),
    updateCartItem: (id: string | number, body: Record<string, unknown>) =>
      request(`${WC_PREFIX}/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    removeCartItem: (id: string | number) =>
      request(`${WC_PREFIX}/cart/${id}`, { method: 'DELETE' }),
    checkout: (body: Record<string, unknown>) =>
      request(`${WC_PREFIX}/cart/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          ...body,
          guest_id: getGuestId(),
          payment_method: 'COD',
          currency: 'IRR',
        }),
      }),
    orders: () => request(`${WC_PREFIX}/orders`),
    addresses: () => request(`${WC_PREFIX}/addresses`),
    createAddress: (body: Record<string, unknown>) =>
      request(`${WC_PREFIX}/addresses`, { method: 'POST', body: JSON.stringify(body) }),
  },
};

export { API_URL };
