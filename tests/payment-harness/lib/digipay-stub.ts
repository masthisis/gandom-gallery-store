import http from 'node:http';
import { URL } from 'node:url';
import { DIGIPAY_STUB_PORT } from './config.js';

export type StubMode = 'normal' | 'oauth_fail' | 'ticket_fail' | 'verify_fail';

export type StubLog = {
  oauthCalls: number;
  ticketCalls: number;
  verifyCalls: number;
  refundCalls: number;
  lastTicketBody: Record<string, unknown> | null;
};

export function createDigipayStub(port = DIGIPAY_STUB_PORT) {
  let mode: StubMode = 'normal';
  const tickets = new Map<string, { providerId: string; callbackUrl: string; amount: number }>();
  const log: StubLog = {
    oauthCalls: 0,
    ticketCalls: 0,
    verifyCalls: 0,
    refundCalls: 0,
    lastTicketBody: null,
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    const path = url.pathname;
    const method = req.method || 'GET';

    if (path === '/stub/mode' && method === 'POST') {
      const body = await readBody(req);
      const parsed = JSON.parse(body || '{}');
      mode = (parsed.mode as StubMode) || 'normal';
      json(res, 200, { mode });
      return;
    }

    if (path === '/stub/log' && method === 'GET') {
      json(res, 200, log);
      return;
    }

    if (path === '/stub/reset' && method === 'POST') {
      log.oauthCalls = 0;
      log.ticketCalls = 0;
      log.verifyCalls = 0;
      log.refundCalls = 0;
      log.lastTicketBody = null;
      tickets.clear();
      mode = 'normal';
      json(res, 200, { ok: true });
      return;
    }

    if (path === '/digipay/api/oauth/token' && method === 'POST') {
      log.oauthCalls += 1;
      if (mode === 'oauth_fail') {
        json(res, 401, { error: 'oauth_fail' });
        return;
      }
      json(res, 200, {
        access_token: 'stub-access-token',
        refresh_token: 'stub-refresh-token',
        expires_in: 3600,
      });
      return;
    }

    if (path.startsWith('/digipay/api/tickets/business') && method === 'POST') {
      log.ticketCalls += 1;
      const body = await readBody(req);
      const parsed = JSON.parse(body || '{}');
      log.lastTicketBody = parsed;
      if (mode === 'ticket_fail') {
        json(res, 400, { error: 'ticket_fail' });
        return;
      }
      const ticket = `STUB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const providerId = String(parsed.providerId || '');
      const callbackUrl = String(parsed.callbackUrl || '');
      tickets.set(ticket, {
        providerId,
        callbackUrl,
        amount: Number(parsed.amount) || 0,
      });
      const redirectUrl = `http://127.0.0.1:${port}/stub/pay?ticket=${encodeURIComponent(ticket)}`;
      json(res, 200, { ticket, redirectUrl });
      return;
    }

    if (path === '/digipay/api/purchases/verify' && method === 'POST') {
      log.verifyCalls += 1;
      if (mode === 'verify_fail') {
        json(res, 400, { error: 'verify_fail' });
        return;
      }
      json(res, 200, { ok: true });
      return;
    }

    if (path === '/digipay/api/refunds' && method === 'POST') {
      log.refundCalls += 1;
      json(res, 200, { ok: true });
      return;
    }

    if (path === '/stub/pay' && method === 'GET') {
      const ticket = url.searchParams.get('ticket') || '';
      const result = url.searchParams.get('result') || 'SUCCESS';
      const meta = tickets.get(ticket);
      if (!meta?.callbackUrl) {
        res.writeHead(404);
        res.end('ticket not found');
        return;
      }
      const target = new URL(meta.callbackUrl);
      target.searchParams.set('status', result);
      target.searchParams.set('ticket', ticket);
      target.searchParams.set('providerId', meta.providerId);
      res.writeHead(302, { Location: target.toString() });
      res.end();
      return;
    }

    if (path === '/stub/fail' && method === 'GET') {
      const ticket = url.searchParams.get('ticket') || '';
      const meta = tickets.get(ticket);
      if (!meta?.callbackUrl) {
        res.writeHead(404);
        res.end('ticket not found');
        return;
      }
      const target = new URL(meta.callbackUrl);
      target.searchParams.set('status', 'FAILED');
      target.searchParams.set('ticket', ticket);
      target.searchParams.set('providerId', meta.providerId);
      res.writeHead(302, { Location: target.toString() });
      res.end();
      return;
    }

    res.writeHead(404);
    res.end('not found');
  });

  return {
    server,
    log,
    setMode: (m: StubMode) => {
      mode = m;
    },
    start: () =>
      new Promise<void>((resolve) => {
        server.listen(port, '0.0.0.0', () => resolve());
      }),
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
    url: `http://127.0.0.1:${port}`,
  };
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

function json(res: http.ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// CLI entry for manual stub
if (import.meta.url === `file://${process.argv[1]}`) {
  const stub = createDigipayStub();
  stub.start().then(() => {
    console.log(`Digipay stub on http://127.0.0.1:${DIGIPAY_STUB_PORT}`);
  });
}
