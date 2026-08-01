/**
 * Liara SMTP mailer — https://docs.liara.ir/email-server/how-tos/connect-via-platform/nodejs/
 * Env: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM
 */

import nodemailer from 'nodemailer';

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  tag?: string;
};

function mailConfig() {
  const host = process.env.MAIL_HOST || '';
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USER || '';
  const pass = process.env.MAIL_PASSWORD || '';
  const from = process.env.MAIL_FROM || '';
  const secure =
    process.env.MAIL_SECURE === 'true' ||
    process.env.MAIL_SECURE === '1' ||
    port === 465;
  return { host, port, user, pass, from, secure };
}

export function isMailConfigured(): boolean {
  const c = mailConfig();
  return !!(c.host && c.user && c.pass && c.from);
}

export async function sendMail(payload: MailPayload): Promise<{ ok: boolean; error?: string }> {
  const c = mailConfig();
  if (!c.host || !c.user || !c.pass || !c.from) {
    return { ok: false, error: 'MAIL_* env not configured (Liara SMTP)' };
  }

  const transporter = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,
    auth: { user: c.user, pass: c.pass },
  });

  try {
    await transporter.sendMail({
      from: `"گندم گالری" <${c.from}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html:
        payload.html ||
        `<pre style="font-family:tahoma,sans-serif;white-space:pre-wrap">${payload.text}</pre>`,
      headers: {
        'x-liara-tag': payload.tag || 'gandom_admin_notification',
      },
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
