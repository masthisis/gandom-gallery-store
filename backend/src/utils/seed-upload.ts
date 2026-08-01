import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Core } from '@strapi/strapi';

function resolveAssetsRoot(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'seed-assets'),
    path.join(__dirname, '..', 'seed-assets'),
    path.join(__dirname, '..', '..', 'src', 'seed-assets'),
    path.join(process.cwd(), 'seed-assets'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

const ASSETS_ROOT = resolveAssetsRoot();

type UploadResult = {
  id: number;
  documentId?: string;
  url?: string;
  name?: string;
};

const cache = new Map<string, UploadResult>();

function resolveAsset(...parts: string[]) {
  return path.join(ASSETS_ROOT, ...parts);
}

function mimeFor(filePathOrExt: string): string {
  const ext = (path.extname(filePathOrExt) || filePathOrExt).toLowerCase();
  if (ext === '.svg' || ext === 'svg') return 'image/svg+xml';
  if (ext === '.png' || ext === 'png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg' || ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === '.webp' || ext === 'webp') return 'image/webp';
  if (ext === '.gif' || ext === 'gif') return 'image/gif';
  return 'application/octet-stream';
}

function extFromContentType(ct: string | null): string {
  if (!ct) return '.jpg';
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('svg')) return '.svg';
  return '.jpg';
}

async function findExistingByName(strapi: Core.Strapi, baseName: string): Promise<UploadResult | null> {
  try {
    const existing = await strapi.db.query('plugin::upload.file').findOne({
      where: { name: baseName },
    });
    if (existing?.id) {
      return {
        id: existing.id,
        documentId: existing.documentId,
        url: existing.url,
        name: existing.name,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function uploadLocalFile(
  strapi: Core.Strapi,
  absolute: string,
  fileInfo: { name: string; alternativeText?: string; caption?: string }
): Promise<UploadResult | null> {
  const baseName = fileInfo.name;
  const existing = await findExistingByName(strapi, baseName);
  if (existing) {
    cache.set(baseName, existing);
    return existing;
  }

  const stats = fs.statSync(absolute);
  const files = {
    filepath: absolute,
    path: absolute,
    name: baseName,
    originalFilename: baseName,
    type: mimeFor(absolute),
    mimetype: mimeFor(absolute),
    size: stats.size,
  };

  try {
    const uploaded = await strapi.plugin('upload').service('upload').upload({
      data: {
        fileInfo: {
          name: baseName,
          alternativeText: fileInfo.alternativeText || baseName,
          caption: fileInfo.caption || '',
        },
      },
      files,
    });
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!file?.id) {
      strapi.log.warn(`[gandom-seed] upload returned empty for ${baseName}`);
      return null;
    }
    const hit = {
      id: file.id,
      documentId: file.documentId,
      url: file.url,
      name: file.name,
    };
    cache.set(baseName, hit);
    return hit;
  } catch (e) {
    strapi.log.warn(`[gandom-seed] upload failed ${baseName}`, e);
    return null;
  }
}

/**
 * Upload a local seed asset once (cached by file name). Returns Strapi file entity.
 */
export async function uploadSeedAsset(
  strapi: Core.Strapi,
  relativePath: string,
  fileInfo: { name?: string; alternativeText?: string; caption?: string } = {}
): Promise<UploadResult | null> {
  const key = relativePath.replace(/\\/g, '/');
  const baseName = fileInfo.name || path.basename(key);
  if (cache.has(baseName)) return cache.get(baseName)!;

  const absolute = resolveAsset(...key.split('/'));
  if (!fs.existsSync(absolute)) {
    strapi.log.warn(`[gandom-seed] missing asset: ${absolute}`);
    return null;
  }

  return uploadLocalFile(strapi, absolute, {
    name: baseName,
    alternativeText: fileInfo.alternativeText,
    caption: fileInfo.caption,
  });
}

/**
 * Download a remote image and store it in Strapi Media Library.
 * Strapi does not auto-fetch media from a URL field — this is the supported approach.
 */
export async function uploadSeedFromUrl(
  strapi: Core.Strapi,
  url: string,
  fileInfo: { name: string; alternativeText?: string; caption?: string }
): Promise<UploadResult | null> {
  const baseName = fileInfo.name;
  if (cache.has(baseName)) return cache.get(baseName)!;

  const existing = await findExistingByName(strapi, baseName);
  if (existing) {
    cache.set(baseName, existing);
    return existing;
  }

  let tmpPath: string | null = null;
  try {
    let res: Response | null = null;
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await fetch(url, {
          headers: {
            'User-Agent': 'GandomGallerySeed/1.0',
            Accept: 'image/*,*/*',
          },
          redirect: 'follow',
        });
        if (res.ok) break;
        lastErr = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    if (!res?.ok) {
      strapi.log.warn(`[gandom-seed] download failed ${url}`, lastErr);
      return null;
    }

    const ct = res.headers.get('content-type');
    let ext = path.extname(baseName);
    if (!ext || ext.length > 5) {
      ext = extFromContentType(ct);
    }
    const safeName = baseName.includes('.') ? baseName : `${baseName}${ext}`;
    tmpPath = path.join(os.tmpdir(), `gandom-seed-${Date.now()}-${safeName}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) {
      strapi.log.warn(`[gandom-seed] download too small for ${url}`);
      return null;
    }
    fs.writeFileSync(tmpPath, buf);

    return await uploadLocalFile(strapi, tmpPath, {
      name: safeName,
      alternativeText: fileInfo.alternativeText,
      caption: fileInfo.caption,
    });
  } catch (e) {
    strapi.log.warn(`[gandom-seed] url upload failed ${url}`, e);
    return null;
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      try {
        fs.unlinkSync(tmpPath);
      } catch {
        /* ignore */
      }
    }
  }
}

/** Prefer remote URL; fall back to a local SVG/PNG under seed-assets. */
export async function uploadSeedImage(
  strapi: Core.Strapi,
  opts: {
    url?: string;
    asset?: string;
    name: string;
    alternativeText?: string;
  }
): Promise<UploadResult | null> {
  if (opts.url) {
    const fromUrl = await uploadSeedFromUrl(strapi, opts.url, {
      name: opts.name,
      alternativeText: opts.alternativeText,
    });
    if (fromUrl) return fromUrl;
  }
  if (opts.asset) {
    const assetName = opts.name?.endsWith('.jpg') || opts.name?.endsWith('.jpeg')
      ? opts.name.replace(/\.(jpe?g)$/i, path.extname(opts.asset) || '.svg')
      : opts.name;
    return uploadSeedAsset(strapi, opts.asset, {
      name: assetName || path.basename(opts.asset),
      alternativeText: opts.alternativeText,
    });
  }
  return null;
}

export function publicGalleryUrl(productFile: string): string {
  return `/products/${productFile}`;
}

export { ASSETS_ROOT };
