import pg from 'pg';
import { PG } from './config.js';

export async function withDb<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client(PG);
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function findOrderByProviderId(providerId: string) {
  return withDb(async (client) => {
    const byNumber = await client.query(
      `SELECT id, order_number, payment_status, status, total, document_id
       FROM orders WHERE order_number = $1 LIMIT 1`,
      [providerId]
    );
    if (byNumber.rows[0]) return byNumber.rows[0];

    const byDoc = await client.query(
      `SELECT id, order_number, payment_status, status, total, document_id
       FROM orders WHERE document_id = $1 LIMIT 1`,
      [providerId]
    );
    if (byDoc.rows[0]) return byDoc.rows[0];

    const asNum = Number(providerId);
    if (Number.isFinite(asNum) && asNum > 0) {
      const byId = await client.query(
        `SELECT id, order_number, payment_status, status, total, document_id
         FROM orders WHERE id = $1 LIMIT 1`,
        [asNum]
      );
      return byId.rows[0] || null;
    }
    return null;
  });
}

export async function findTransactionByTicket(ticket: string) {
  return withDb(async (client) => {
    const res = await client.query(
      `SELECT id, transaction_id, status, amount
       FROM payment_transactions WHERE transaction_id = $1 LIMIT 1`,
      [ticket]
    );
    return res.rows[0] || null;
  });
}

export async function findUserByPhone(phone: string) {
  return withDb(async (client) => {
    const res = await client.query(
      `SELECT id, first_name, last_name, phone_no FROM up_users WHERE phone_no = $1 LIMIT 1`,
      [phone]
    );
    return res.rows[0] || null;
  });
}

export async function getUserOtp(phone: string): Promise<string | null> {
  return withDb(async (client) => {
    const res = await client.query(
      `SELECT otp FROM up_users WHERE phone_no = $1 LIMIT 1`,
      [phone]
    );
    const otp = res.rows[0]?.otp;
    return otp != null ? String(otp) : null;
  });
}

export async function resetSmsSettingsDev() {
  return withDb(async (client) => {
    const res = await client.query(`SELECT id FROM sms_settings LIMIT 1`);
    if (!res.rows[0]) return;
    await client.query(
      `UPDATE sms_settings SET
        enabled = false,
        dev_mode = true,
        dev_otp_code = '11111'
       WHERE id = $1`,
      [res.rows[0].id]
    );
  });
}

export async function resetPaymentSettingsMock() {
  return withDb(async (client) => {
    const res = await client.query(`SELECT id FROM payment_settings LIMIT 1`);
    if (!res.rows[0]) return;
    await client.query(
      `UPDATE payment_settings SET
        enabled = false,
        mock_mode = true,
        base_url = 'https://uat.mydigipay.info',
        callback_url = 'http://localhost:5173/payment/callback'
       WHERE id = $1`,
      [res.rows[0].id]
    );
  });
}

export async function setPaymentSettingsLive(stubBaseUrl: string) {
  return withDb(async (client) => {
    const res = await client.query(`SELECT id FROM payment_settings LIMIT 1`);
    if (!res.rows[0]) return;
    await client.query(
      `UPDATE payment_settings SET
        enabled = true,
        mock_mode = false,
        base_url = $1,
        client_id = 'stub-client',
        client_secret = 'stub-secret',
        username = 'stub-user',
        password = 'stub-pass',
        callback_url = 'http://localhost:5173/payment/callback'
       WHERE id = $2`,
      [stubBaseUrl, res.rows[0].id]
    );
  });
}
