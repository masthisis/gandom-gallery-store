import { factories } from '@strapi/strapi';
import { mediaUrl } from '../../../utils/media-url';

function parseIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapProduct(p: any) {
  return {
    id: p.id,
    documentId: p.documentId,
    name: p.name,
    slug: p.slug,
    price: p.price,
    sale_price: p.sale_price,
    stock_quantity: p.stock_quantity,
    stock_status: p.stock_status,
    images: p.images,
    categories: p.product_categories,
  };
}

function componentType(uid: string | undefined): string {
  if (!uid) return 'unknown';
  // sections.hero-slider → hero_slider
  const name = uid.includes('.') ? uid.split('.').pop()! : uid;
  return name.replace(/-/g, '_');
}

async function resolveProducts(strapi: any, opts: {
  source?: string;
  categorySlug?: string;
  productIds?: string;
  limit?: number;
  preferSale?: boolean;
}) {
  const limit = opts.limit || 8;
  const ids = parseIds(opts.productIds);
  let products: any[] = [];

  try {
    if ((opts.source === 'manual' || ids.length) && ids.length) {
      for (const id of ids) {
        const p = await strapi.db.query('plugin::webbycommerce.product').findOne({
          where: { $or: [{ documentId: id }, { slug: id }] },
          populate: ['images', 'product_categories'],
        });
        if (p) products.push(p);
      }
    } else if (opts.source === 'sale' || opts.preferSale) {
      products = await strapi.db.query('plugin::webbycommerce.product').findMany({
        where: { sale_price: { $notNull: true } },
        limit,
        populate: ['images', 'product_categories'],
        orderBy: { updatedAt: 'desc' },
      });
    } else if (opts.source === 'category' && opts.categorySlug) {
      const cat = await strapi.db.query('plugin::webbycommerce.product-category').findOne({
        where: { slug: opts.categorySlug },
      });
      if (cat) {
        products = await strapi.db.query('plugin::webbycommerce.product').findMany({
          where: { product_categories: { id: cat.id } },
          limit,
          populate: ['images', 'product_categories'],
        });
      }
    } else {
      products = await strapi.db.query('plugin::webbycommerce.product').findMany({
        limit,
        populate: ['images', 'product_categories'],
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (e) {
    strapi.log.warn('[homepage] resolveProducts', e);
  }

  return products.map(mapProduct);
}

function mapSlide(slide: any) {
  return {
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    image: mediaUrl(slide?.image) || slide?.imageUrl || '',
    link: slide?.link || '/shop',
  };
}

export default factories.createCoreController('api::homepage.homepage', ({ strapi }) => ({
  async find(ctx) {
    const populateSections = {
      sections: {
        on: {
          'sections.hero-slider': { populate: { slides: { populate: ['image'] } } },
          'sections.image-slider': { populate: { slides: { populate: ['image'] } } },
          'sections.product-slider': true,
          'sections.product-row': true,
          'sections.mixed-slider': { populate: { items: { populate: ['image'] } } },
          'sections.incredible-offers': true,
          'sections.banner-grid': { populate: { banners: { populate: ['image'] } } },
          'sections.story-row': { populate: { items: { populate: ['image'] } } },
          'sections.category-grid': true,
          'sections.trust-badges': { populate: { items: true } },
        },
      },
    } as any;

    let entity: any = await strapi.documents('api::homepage.homepage').findFirst({
      status: 'published',
      populate: populateSections,
    });

    if (!entity) {
      entity = await strapi.documents('api::homepage.homepage').findFirst({
        populate: populateSections,
      });
    }

    if (!entity) {
      return { data: null };
    }

    const rawSections = Array.isArray(entity.sections) ? entity.sections : [];
    const sections: any[] = [];

    for (const raw of rawSections) {
      if (!raw || typeof raw !== 'object') continue;
      const type = componentType(raw.__component);
      const base: any = {
        id: raw.id || `${type}-${sections.length}`,
        type,
        __component: raw.__component,
      };

      if (type === 'hero_slider' || type === 'image_slider') {
        base.title = raw.title;
        base.slides = (raw.slides || []).map(mapSlide);
      } else if (type === 'product_slider' || type === 'product_row') {
        base.title = raw.title;
        base.link = raw.link;
        base.source = raw.source;
        base.categorySlug = raw.categorySlug;
        base.limit = raw.limit;
        base.products = await resolveProducts(strapi, {
          source: raw.source,
          categorySlug: raw.categorySlug,
          productIds: raw.productIds,
          limit: raw.limit,
        });
      } else if (type === 'incredible_offers') {
        base.title = raw.title || 'پیشنهاد شگفت‌انگیز';
        base.themeColor = raw.themeColor || '#ef4056';
        base.endsAt = raw.endsAt;
        base.link = raw.link;
        base.source = raw.source || 'sale';
        base.products = await resolveProducts(strapi, {
          source: raw.source || 'sale',
          productIds: raw.productIds,
          limit: raw.limit,
          preferSale: true,
        });
      } else if (type === 'mixed_slider') {
        base.title = raw.title;
        const items = [];
        for (const item of raw.items || []) {
          if (item.kind === 'product' && item.productDocumentId) {
            const products = await resolveProducts(strapi, {
              source: 'manual',
              productIds: item.productDocumentId,
              limit: 1,
            });
            items.push({
              kind: 'product',
              title: item.title,
              link: item.link,
              product: products[0] || null,
            });
          } else {
            items.push({
              kind: 'image',
              title: item.title,
              image: mediaUrl(item.image) || item.imageUrl || '',
              link: item.link || '#',
            });
          }
        }
        base.items = items;
      } else if (type === 'banner_grid') {
        base.columns = Number(raw.columns || 2);
        base.banners = (raw.banners || []).map((b: any) => ({
          title: b.title,
          image: mediaUrl(b.image) || b.imageUrl || '',
          link: b.link || '/shop',
        }));
      } else if (type === 'story_row') {
        base.items = (raw.items || []).map((it: any) => ({
          title: it.title,
          image: mediaUrl(it.image) || it.imageUrl || '',
          link: it.link || '/shop',
          color: it.color || '#ef4056',
        }));
      } else if (type === 'category_grid') {
        base.title = raw.title || 'دسته‌بندی‌ها';
        const slugs = parseIds(raw.categorySlugs);
        let cats: any[] = [];
        try {
          if (slugs.length) {
            cats = await strapi.db.query('api::nav-category.nav-category').findMany({
              where: { slug: { $in: slugs } },
              populate: ['image'],
            });
          } else {
            cats = await strapi.db.query('api::nav-category.nav-category').findMany({
              where: { $or: [{ parent: null }, { parent: { $null: true } }] },
              populate: ['image'],
              orderBy: { menu_order: 'asc' },
              limit: 16,
            });
          }
        } catch {
          cats = await strapi.db.query('plugin::webbycommerce.product-category').findMany({
            populate: ['image'],
            limit: 16,
          });
        }
        base.categories = cats.map((c) => ({
          id: c.id,
          documentId: c.documentId,
          name: c.name,
          slug: c.commerceSlug || c.slug,
          image: mediaUrl(c.image),
        }));
      } else if (type === 'trust_badges') {
        base.items = (raw.items || []).map((it: any) => ({
          title: it.title,
          text: it.text,
        }));
      } else {
        Object.assign(base, raw);
      }

      sections.push(base);
    }

    return {
      data: {
        id: entity.id,
        documentId: entity.documentId,
        seoTitle: entity.seoTitle,
        seoDescription: entity.seoDescription,
        sections,
      },
    };
  },
}));
