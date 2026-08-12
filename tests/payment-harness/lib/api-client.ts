import {
  API_URL,
  WC_PREFIX,
  SHOP_OWNER_EMAIL,
  SHOP_OWNER_PASSWORD,
  OTP_DEV_CODE,
  TEST_MOBILE,
  SMS_TEST_MOBILE,
} from './config.js';

let sharedGuestId: string | null = null;
function guestId() {
  if (!sharedGuestId) {
    sharedGuestId = `harness-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sharedGuestId;
}

export function resetGuestCart() {
  sharedGuestId = null;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit & { token?: string; adminToken?: string } = {}
): Promise<{ status: number; data: T }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.adminToken) headers.Authorization = `Bearer ${options.adminToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

export async function healthCheck() {
  const store = await apiRequest('/api/store-setting');
  return store.status === 200;
}

export async function loginWithOtp(mobile = TEST_MOBILE) {
  await requestOtp(mobile);
  return verifyOtp(mobile, OTP_DEV_CODE);
}

export async function requestOtp(mobile = TEST_MOBILE) {
  return apiRequest('/api/auth-otp/request', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

export async function verifyOtp(mobile: string, otp: string) {
  const verify = await apiRequest<{ jwt?: string; token?: string }>('/api/auth-otp/verify', {
    method: 'POST',
    body: JSON.stringify({ mobile, otp }),
  });
  const jwt =
    (verify.data as any)?.jwt ||
    (verify.data as any)?.token ||
    (verify.data as any)?.data?.jwt;
  if (!jwt) throw new Error(`OTP verify failed: ${JSON.stringify(verify.data)}`);
  return jwt as string;
}

let cachedAdminToken: string | null = null;

export async function adminLogin() {
  if (cachedAdminToken) return cachedAdminToken;
  const res = await apiRequest<{ data?: { token?: string } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email: SHOP_OWNER_EMAIL,
      password: SHOP_OWNER_PASSWORD,
    }),
  });
  const token = (res.data as any)?.data?.token || (res.data as any)?.token;
  if (!token) throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
  cachedAdminToken = token as string;
  return cachedAdminToken;
}

export async function getProductBySlug(slug: string) {
  const res = await apiRequest(`${WC_PREFIX}/products/${slug}`, { auth: false } as any);
  const body = res.data as any;
  return body?.data || body;
}

export async function addToCart(token: string, productId: string | number, quantity = 1) {
  const gid = guestId();
  return apiRequest(`${WC_PREFIX}/cart`, {
    method: 'POST',
    token,
    body: JSON.stringify({
      productId,
      quantity,
      guest_id: gid,
      currency: 'IRR',
    }),
  });
}

export async function checkout(token: string, addressPayload: Record<string, unknown>) {
  const gid = guestId();
  return apiRequest(`${WC_PREFIX}/cart/checkout`, {
    method: 'POST',
    token,
    body: JSON.stringify({
      billing_address: addressPayload,
      shipping_address: addressPayload,
      payment_method: 'COD',
      currency: 'IRR',
      guest_id: gid,
    }),
  });
}

export async function createDigipayTicket(
  token: string,
  body: Record<string, unknown>
) {
  return apiRequest('/api/digipay/ticket', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export async function digipayCallback(query: string) {
  return apiRequest(`/api/digipay/callback?${query}`, { auth: false } as any);
}

export async function digipayRefund(body: Record<string, unknown>, secret?: string) {
  return apiRequest('/api/digipay/refund', {
    method: 'POST',
    headers: secret ? { 'x-refund-secret': secret } : {},
    body: JSON.stringify(body),
  });
}

export async function adminGetPaymentSettings(adminToken: string) {
  return apiRequest('/gandom-shop/payment-settings', { adminToken });
}

export async function adminPutPaymentSettings(
  adminToken: string,
  body: Record<string, unknown>
) {
  return apiRequest('/gandom-shop/payment-settings', {
    method: 'PUT',
    adminToken,
    body: JSON.stringify(body),
  });
}

export async function adminTestConnection(adminToken: string) {
  return apiRequest('/gandom-shop/payment-settings/test-connection', {
    method: 'POST',
    adminToken,
    body: JSON.stringify({}),
  });
}

export async function adminGetSmsSettings(adminToken: string) {
  return apiRequest('/gandom-shop/sms-settings', { adminToken });
}

export async function adminPutSmsSettings(
  adminToken: string,
  body: Record<string, unknown>
) {
  return apiRequest('/gandom-shop/sms-settings', {
    method: 'PUT',
    adminToken,
    body: JSON.stringify(body),
  });
}

export async function adminTestSmsConnection(adminToken: string, mobile = SMS_TEST_MOBILE) {
  return apiRequest('/gandom-shop/sms-settings/test-connection', {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ mobile }),
  });
}

export async function adminGetSmsGoLiveChecklist(adminToken: string) {
  return apiRequest('/gandom-shop/sms-settings/go-live-checklist', { adminToken });
}

export async function adminTestSmsEvent(
  adminToken: string,
  event: string,
  mobile = SMS_TEST_MOBILE
) {
  return apiRequest('/gandom-shop/sms-settings/test-event', {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ event, mobile }),
  });
}

export async function adminTestAllSms(adminToken: string, mobile = SMS_TEST_MOBILE) {
  return apiRequest('/gandom-shop/sms-settings/test-all', {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ mobile }),
  });
}

export async function adminListPayments(adminToken: string, query = '') {
  return apiRequest(`/gandom-shop/payments${query ? `?${query}` : ''}`, { adminToken });
}

export async function adminGetPayment(adminToken: string, id: string | number) {
  return apiRequest(`/gandom-shop/payments/${id}`, { adminToken });
}

export async function adminRefundPayment(
  adminToken: string,
  id: string | number,
  amountToman?: number
) {
  return apiRequest(`/gandom-shop/payments/${id}/refund`, {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ amountToman }),
  });
}

export async function adminMarkOrderPaid(
  adminToken: string,
  orderId: string | number,
  reason: string
) {
  return apiRequest(`/gandom-shop/orders/${orderId}/mark-paid`, {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ reason }),
  });
}

export async function adminMarkOrderFailed(
  adminToken: string,
  orderId: string | number,
  reason: string
) {
  return apiRequest(`/gandom-shop/orders/${orderId}/mark-failed`, {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ reason }),
  });
}

export async function adminOverview(adminToken: string) {
  return apiRequest('/gandom-shop/overview', { adminToken });
}

export async function adminTestPaymentNotification(
  adminToken: string,
  event: 'order_paid' | 'payment_failed'
) {
  return apiRequest('/gandom-shop/test-payment-notification', {
    method: 'POST',
    adminToken,
    body: JSON.stringify({ event }),
  });
}

export const FIXTURE_ADDRESS = {
  firstName: 'علی',
  lastName: 'رضایی',
  province: 'تهران',
  city: 'تهران',
  address: 'خیابان ولیعصر',
  plaque: '۱۲',
  unit: '۳',
  postcode: '1234567890',
  phone: TEST_MOBILE,
  type: 1,
  country: 'IR',
  region: 'تهران',
  street_address: 'خیابان ولیعصر پلاک ۱۲ واحد ۳',
};

export function toPluginAddress(snapshot: typeof FIXTURE_ADDRESS) {
  return {
    type: 1,
    country: 'IR',
    region: snapshot.province,
    city: snapshot.city,
    street_address: `${snapshot.address} پلاک ${snapshot.plaque} واحد ${snapshot.unit}`,
    postcode: snapshot.postcode,
    phone: snapshot.phone,
    first_name: snapshot.firstName,
    last_name: snapshot.lastName,
  };
}
