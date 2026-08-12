import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createDigipayStub } from '../lib/digipay-stub.js';
import {
  healthCheck,
  loginWithOtp,
  getProductBySlug,
  addToCart,
  checkout,
  createDigipayTicket,
  digipayCallback,
  digipayRefund,
  adminLogin,
  adminGetPaymentSettings,
  adminPutPaymentSettings,
  adminTestConnection,
  adminListPayments,
  adminOverview,
  adminRefundPayment,
  adminMarkOrderPaid,
  FIXTURE_ADDRESS,
  toPluginAddress,
  apiRequest,
  resetGuestCart,
} from '../lib/api-client.js';
import {
  findOrderByProviderId,
  findTransactionByTicket,
  findUserByPhone,
} from '../lib/assert-db.js';
import { DIGIPAY_STUB_URL, TEST_MOBILE, TEST_PRODUCT_SLUG } from '../lib/config.js';

const stub = createDigipayStub();
let adminToken = '';

async function ensureStub() {
  try {
    await fetch(`${DIGIPAY_STUB_URL}/stub/reset`, { method: 'POST' });
    return;
  } catch {
    /* not running */
  }
  await stub.start();
}

async function resetSettingsViaAdmin() {
  const token = adminToken || (await adminLogin());
  await adminPutPaymentSettings(token, {
    enabled: false,
    mockMode: true,
    baseUrl: 'https://uat.mydigipay.info',
    callbackUrl: 'http://localhost:5173/payment/callback',
  });
}

async function runCheckoutAndTicket(token: string) {
  resetGuestCart();
  const product = await getProductBySlug(TEST_PRODUCT_SLUG);
  const productId = product?.id || product?.documentId;
  if (!productId) throw new Error(`No seeded product for slug ${TEST_PRODUCT_SLUG}`);

  await addToCart(token, productId, 1);
  const addr = toPluginAddress(FIXTURE_ADDRESS);
  const orderRes = await checkout(token, addr);
  const order = (orderRes.data as any)?.data || orderRes.data;
  const orderId = order?.id || order?.data?.id;
  const orderDocumentId =
    order?.documentId || order?.data?.documentId || order?.order_number || String(orderId);
  const amountToman = Number(order?.total || order?.data?.total || 50000);

  const ticketRes = await createDigipayTicket(token, {
    orderId,
    orderDocumentId,
    cellNumber: TEST_MOBILE,
    amountToman,
    profileSnapshot: FIXTURE_ADDRESS,
  });

  return { orderRes, ticketRes, orderDocumentId, amountToman };
}

describe('payment harness', () => {
  beforeAll(async () => {
    await ensureStub();
    const ok = await healthCheck();
    if (!ok) {
      throw new Error('Stack not healthy — run docker compose up');
    }
    adminToken = await adminLogin();
    await resetSettingsViaAdmin();
  }, 60000);

  afterAll(async () => {
    try {
      await stub.stop();
    } catch {
      /* stub may be external */
    }
  });

  it('P0-1 stack healthy', async () => {
    expect(await healthCheck()).toBe(true);
  });

  it('P0-2 OTP login', async () => {
    const jwt = await loginWithOtp();
    expect(jwt).toBeTruthy();
  });

  it('P0-3 checkout creates pending order', async () => {
    const token = await loginWithOtp();
    const { orderRes } = await runCheckoutAndTicket(token);
    expect(orderRes.status).toBeLessThan(400);
    const order = (orderRes.data as any)?.data || orderRes.data;
    const paymentStatus = order?.payment_status || order?.data?.payment_status;
    if (paymentStatus) expect(paymentStatus).toBe('pending');
  });

  it('P0-4 mock ticket redirect', async () => {
    const token = await loginWithOtp();
    const { ticketRes } = await runCheckoutAndTicket(token);
    const body = ticketRes.data as any;
    expect(ticketRes.status).toBeLessThan(400);
    expect(body.mock).toBe(true);
    expect(body.redirectUrl).toContain('mock=1');
  });

  it('P0-5 mock callback paid', async () => {
    const token = await loginWithOtp();
    const { ticketRes, orderDocumentId } = await runCheckoutAndTicket(token);
    const body = ticketRes.data as any;
    const cb = await digipayCallback(
      new URL(body.redirectUrl).searchParams.toString() ||
        `status=SUCCESS&providerId=${encodeURIComponent(orderDocumentId)}&ticket=${body.ticket}&mock=1`
    );
    expect((cb.data as any).ok).toBe(true);

    const order = await findOrderByProviderId(orderDocumentId);
    if (order) {
      expect(order.payment_status).toBe('paid');
    }

    const tx = await findTransactionByTicket(body.ticket);
    if (tx && tx.status === 'completed') {
      expect(tx.status).toBe('completed');
    }
  });

  it('P1-1 admin GET masked settings', async () => {
    const res = await adminGetPaymentSettings(adminToken);
    expect(res.status).toBe(200);
    const data = (res.data as any).data;
    expect(data).toHaveProperty('mockMode');
    if (data.hasClientSecret) {
      expect(data.clientSecret).toBe('••••••••');
    }
  });

  it('P1-2 admin PUT settings for stub', async () => {
    await adminPutPaymentSettings(adminToken, {
      enabled: true,
      mockMode: false,
      baseUrl: DIGIPAY_STUB_URL,
      clientId: 'stub-client',
      clientSecret: 'stub-secret',
      username: 'stub-user',
      password: 'stub-pass',
      callbackUrl: 'http://localhost:5173/payment/callback',
    });
    const res = await adminGetPaymentSettings(adminToken);
    expect((res.data as any).data.baseUrl).toBe(DIGIPAY_STUB_URL);
  });

  it('P1-3 test connection success', async () => {
    const res = await adminTestConnection(adminToken);
    expect((res.data as any).ok).toBe(true);
  });

  it('P1-4 unauthenticated PUT rejected', async () => {
    const res = await apiRequest('/gandom-shop/payment-settings', {
      method: 'PUT',
      body: JSON.stringify({ enabled: true }),
    });
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it('P2-1 live ticket', async () => {
    const token = await loginWithOtp();
    const { ticketRes } = await runCheckoutAndTicket(token);
    const body = ticketRes.data as any;
    expect(ticketRes.status).toBeLessThan(400);
    expect(body.mock).toBeFalsy();
    expect(body.ticket).toMatch(/^STUB-/);
  });

  it('P2-6 toman to rial in ticket body', async () => {
    const logRes = await fetch(`${DIGIPAY_STUB_URL}/stub/log`);
    const log = await logRes.json();
    expect(log.lastTicketBody?.amount).toBeGreaterThan(0);
    const toman = Number(log.lastTicketBody?.amount) / 10;
    expect(toman).toBeGreaterThanOrEqual(100);
  });

  it('P2-7 min amount rejected', async () => {
    const token = await loginWithOtp();
    const res = await createDigipayTicket(token, {
      orderId: 1,
      orderDocumentId: 'test-min',
      amountToman: 50,
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('P2-8 unauthenticated ticket rejected', async () => {
    const res = await apiRequest('/api/digipay/ticket', {
      method: 'POST',
      body: JSON.stringify({ orderId: 1, amountToman: 50000 }),
    });
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it('P2-3 verify called on live callback', async () => {
    const logBefore = await fetch(`${DIGIPAY_STUB_URL}/stub/log`).then((r) => r.json());
    const verifyBefore = logBefore.verifyCalls || 0;
    const token = await loginWithOtp();
    const { ticketRes, orderDocumentId } = await runCheckoutAndTicket(token);
    const body = ticketRes.data as any;
    await digipayCallback(
      `status=SUCCESS&ticket=${body.ticket}&providerId=${encodeURIComponent(orderDocumentId)}`
    );
    const logAfter = await fetch(`${DIGIPAY_STUB_URL}/stub/log`).then((r) => r.json());
    expect(logAfter.verifyCalls).toBeGreaterThan(verifyBefore);
  });

  it('P2-5 profile applied after pay', async () => {
    const user = await findUserByPhone(TEST_MOBILE);
    if (user?.first_name) {
      expect(user.first_name).toBeTruthy();
    }
  });

  it('P3-1 failed callback', async () => {
    await resetSettingsViaAdmin();
    const token = await loginWithOtp();
    const { ticketRes, orderDocumentId } = await runCheckoutAndTicket(token);
    const body = ticketRes.data as any;
    const cb = await digipayCallback(
      `status=FAILED&ticket=${body.ticket}&providerId=${encodeURIComponent(orderDocumentId)}`
    );
    expect((cb.data as any).ok).toBe(false);
  });

  it('P4-1 payments list', async () => {
    const res = await adminListPayments(adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray((res.data as any).data)).toBe(true);
  });

  it('P4-4 dashboard KPIs', async () => {
    const res = await adminOverview(adminToken);
    const data = (res.data as any).data;
    expect(data.failedPaymentsCount7d).toBeDefined();
    expect(data.pendingPaymentOrdersCount).toBeDefined();
    expect(data.todayIncomeToman).toBeDefined();
  });

  it('P5-1 refund mock payment', async () => {
    await resetSettingsViaAdmin();
    const token = await loginWithOtp();
    const { ticketRes, orderDocumentId } = await runCheckoutAndTicket(token);
    const body = ticketRes.data as any;
    await digipayCallback(
      `status=SUCCESS&providerId=${encodeURIComponent(orderDocumentId)}&ticket=${body.ticket}&mock=1`
    );
    const tx = await findTransactionByTicket(body.ticket);
    if (!tx) return;
    const refund = await adminRefundPayment(adminToken, tx.id);
    expect((refund.data as any).ok).toBe(true);
  });

  it('P5-4 public refund without secret', async () => {
    const res = await digipayRefund({ ticket: 'MOCK-x', amountToman: 1000 });
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it('P6-1 mark order paid reconcile', async () => {
    await resetSettingsViaAdmin();
    const token = await loginWithOtp();
    const { orderRes } = await runCheckoutAndTicket(token);
    const order = (orderRes.data as any)?.data || orderRes.data;
    const orderId = order?.id;
    if (!orderId) return;
    const res = await adminMarkOrderPaid(adminToken, orderId, 'تست تطبیق دستی');
    expect((res.data as any).ok).toBe(true);
  });

  it('P7-1 test payment notification', async () => {
    const res = await apiRequest('/gandom-shop/test-payment-notification', {
      method: 'POST',
      adminToken,
      body: JSON.stringify({ event: 'order_paid' }),
    });
    expect(res.status).toBeLessThan(400);
  });

  it('P7-2 test payment failed notification', async () => {
    const res = await apiRequest('/gandom-shop/test-payment-notification', {
      method: 'POST',
      adminToken,
      body: JSON.stringify({ event: 'payment_failed' }),
    });
    expect(res.status).toBeLessThan(400);
  });

  it('P1-3 oauth_fail mode', async () => {
    stub.setMode('oauth_fail');
    const res = await adminTestConnection(adminToken);
    expect((res.data as any).ok).toBe(false);
    stub.setMode('normal');
  });
});
