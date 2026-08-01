import type { Core } from '@strapi/strapi';

function mediaSrcHosts(): string[] {
  const hosts = ["'self'", 'data:', 'blob:', 'https:'];
  const cdn = process.env.CDN_URL;
  const endpoint = process.env.AWS_ENDPOINT;
  if (cdn) hosts.push(cdn);
  if (endpoint) hosts.push(endpoint);
  return hosts;
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
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        process.env.FRONTEND_URL,
        process.env.BACKOFFICE_URL,
      ].filter(Boolean),
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
