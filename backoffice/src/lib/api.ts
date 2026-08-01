const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const WC = import.meta.env.VITE_WC_PREFIX || '/api/webbycommerce';

export function getAdminToken() {
  return localStorage.getItem('gandom_admin_jwt') || localStorage.getItem('gandom_jwt');
}

export function setAdminToken(t: string | null) {
  if (t) localStorage.setItem('gandom_admin_jwt', t);
  else localStorage.removeItem('gandom_admin_jwt');
}

async function req(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.message || 'خطا');
  return data;
}

export const adminApi = {
  login: (identifier: string, password: string) =>
    req('/api/auth/local', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  otpRequest: (mobile: string) =>
    req('/api/auth-otp/request', { method: 'POST', body: JSON.stringify({ mobile }) }),
  otpVerify: (mobile: string, otp: string) =>
    req('/api/auth-otp/verify', { method: 'POST', body: JSON.stringify({ mobile, otp }) }),

  products: () => req(`${WC}/products`),
  createProduct: (body: any) => req(`${WC}/products`, { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) =>
    req(`${WC}/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => req(`${WC}/products/${id}`, { method: 'DELETE' }),
  categories: () => req(`${WC}/product-categories`),
  orders: () => req(`${WC}/orders`),
  updateOrder: (id: string, body: any) =>
    req(`${WC}/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  homepage: () => req('/api/homepage'),
  updateHomepage: (documentId: string, data: any) =>
    req(`/api/homepages/${documentId}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  // Strapi 5 single type update
  saveHomepage: (data: any) =>
    req('/api/homepage', { method: 'PUT', body: JSON.stringify({ data }) }),

  storeSetting: () => req('/api/store-setting'),
  saveStoreSetting: (data: any) =>
    req('/api/store-setting', { method: 'PUT', body: JSON.stringify({ data }) }),

  smsSetting: () => req('/api/sms-setting'),
  saveSmsSetting: (data: any) =>
    req('/api/sms-setting', { method: 'PUT', body: JSON.stringify({ data }) }),

  paymentSetting: () => req('/api/payment-setting'),
  savePaymentSetting: (data: any) =>
    req('/api/payment-setting', { method: 'PUT', body: JSON.stringify({ data }) }),

  pages: () => req('/api/pages'),
  createPage: (data: any) => req('/api/pages', { method: 'POST', body: JSON.stringify({ data }) }),
  updatePage: (id: string, data: any) =>
    req(`/api/pages/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),

  digipayRefund: (body: any) =>
    req('/api/digipay/refund', { method: 'POST', body: JSON.stringify(body) }),
};

export function listOf(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.products)) return res.products;
  if (Array.isArray(res?.orders)) return res.orders;
  return [];
}

export function formatToman(n: number) {
  return new Intl.NumberFormat('fa-IR').format(Math.round(n || 0)) + ' تومان';
}

export { API_URL };
