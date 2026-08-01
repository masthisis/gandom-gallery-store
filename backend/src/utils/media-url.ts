/** Absolute public base for Strapi media (never the storefront URL). */
export function publicMediaBase(): string {
  const raw =
    process.env.PUBLIC_URL ||
    process.env.STRAPI_URL ||
    process.env.API_URL ||
    'http://localhost:1337';
  return String(raw).replace(/\/$/, '');
}

/**
 * Normalize a Strapi media field / path to an absolute URL on the API (or CDN).
 * Rewrites mistaken storefront-hosted /uploads links.
 */
export function mediaUrl(file: unknown): string | null {
  if (!file) return null;

  let url: string | null = null;
  if (typeof file === 'string') {
    url = file;
  } else if (typeof file === 'object' && file !== null) {
    const f = file as Record<string, any>;
    url = f.url || f?.formats?.medium?.url || f?.formats?.small?.url || f?.formats?.thumbnail?.url || null;
  }
  if (!url) return null;

  const base = publicMediaBase();
  const frontend = (process.env.FRONTEND_URL || '').replace(/\/$/, '');

  // Absolute URL pointing at the storefront uploads → rewrite to API
  if (frontend && url.startsWith(`${frontend}/uploads`)) {
    return `${base}${url.slice(frontend.length)}`;
  }
  if (/^https?:\/\/[^/]+\/uploads\//i.test(url) && !url.startsWith(base)) {
    const path = url.replace(/^https?:\/\/[^/]+/i, '');
    if (path.startsWith('/uploads/')) return `${base}${path}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!url.startsWith('/')) url = `/${url}`;
  return `${base}${url}`;
}
