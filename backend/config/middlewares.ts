import type { Core } from '@strapi/strapi';

function mediaSrcHosts(): string[] {
  const hosts = ["'self'", 'data:', 'blob:', 'https:'];
  const cdn = process.env.CDN_URL;
  const endpoint = process.env.AWS_ENDPOINT;
  if (cdn) hosts.push(cdn);
  if (endpoint) hosts.push(endpoint);
  return hosts;
}

/** Local Vite ports + env URLs for storefront / backoffice. */
function corsOrigins(): string[] {
  const origins = new Set<string>();

  for (let port = 5173; port <= 5180; port++) {
    origins.add(`http://localhost:${port}`);
    origins.add(`http://127.0.0.1:${port}`);
  }

  for (const key of ['FRONTEND_URL', 'BACKOFFICE_URL', 'PUBLIC_URL', 'STRAPI_URL'] as const) {
    const value = process.env[key]?.trim();
    if (value) origins.add(value.replace(/\/$/, ''));
  }

  const extra = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  for (const o of extra) origins.add(o.replace(/\/$/, ''));

  return [...origins];
}

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': mediaSrcHosts(),
          'media-src': mediaSrcHosts(),
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: corsOrigins(),
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
