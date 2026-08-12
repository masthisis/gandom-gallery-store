import type { Core } from '@strapi/strapi';

const CM_CONFIG_PREFIX = 'plugin_content_manager_configuration_content_types::';

const PRODUCT_LABELS: Record<string, string> = {
  name: 'نام',
  slug: 'اسلاگ',
  description: 'توضیحات',
  price: 'قیمت (تومان)',
  sale_price: 'قیمت فروش',
  sku: 'کد کالا (SKU)',
  stock_quantity: 'موجودی',
  stock_status: 'وضعیت موجودی',
  weight: 'وزن',
  images: 'تصاویر',
  product_categories: 'دسته‌بندی‌ها',
  specifications: 'مشخصات فنی',
  gallery_urls: 'آدرس تصاویر (JSON)',
  tags: 'برچسب‌ها',
  variations: 'تنوع‌ها',
  reviews: 'نظرات',
  download_file: 'فایل دانلود',
  download_link: 'لینک دانلود',
  download_limit: 'محدودیت دانلود',
  external_url: 'لینک خارجی',
  external_button_text: 'متن دکمه خارجی',
  grouped_products: 'محصولات گروهی',
  parent_product: 'محصول والد',
};

const NAV_CATEGORY_LABELS: Record<string, string> = {
  name: 'نام',
  slug: 'اسلاگ',
  description: 'توضیحات',
  image: 'تصویر',
  commerceSlug: 'اسلاگ فروشگاهی',
  parent: 'دسته والد',
  children: 'زیردسته‌ها',
  menu_order: 'ترتیب منو',
  show_in_menu: 'نمایش در منو',
};

type CmConfig = {
  settings?: Record<string, unknown>;
  metadatas?: Record<
    string,
    {
      edit?: { label?: string; description?: string; visible?: boolean; editable?: boolean; placeholder?: string };
      list?: { label?: string; searchable?: boolean; sortable?: boolean };
    }
  >;
  layouts?: {
    edit?: Array<Array<{ name: string; size: number }>>;
    list?: string[];
  };
  uid?: string;
};

function applyLabels(config: CmConfig, labels: Record<string, string>) {
  if (!config.metadatas) config.metadatas = {};

  for (const [field, label] of Object.entries(labels)) {
    if (!config.metadatas[field]) {
      config.metadatas[field] = {
        edit: { label, visible: true, editable: true, description: '', placeholder: '' },
        list: { label, searchable: true, sortable: true },
      };
      continue;
    }
    const meta = config.metadatas[field];
    if (meta.edit) meta.edit.label = label;
    else meta.edit = { label, visible: true, editable: true, description: '', placeholder: '' };
    if (meta.list) meta.list.label = label;
    else meta.list = { label, searchable: true, sortable: true };
  }
}

function ensureProductLayoutFields(config: CmConfig) {
  const edit = config.layouts?.edit;
  if (!Array.isArray(edit)) return;

  const names = new Set(edit.flatMap((row) => row.map((f) => f.name)));
  const extra: Array<{ name: string; size: number }> = [];
  if (!names.has('specifications')) extra.push({ name: 'specifications', size: 6 });
  if (!names.has('gallery_urls')) extra.push({ name: 'gallery_urls', size: 6 });
  if (extra.length) edit.push(extra);
}

async function loadCmConfig(strapi: Core.Strapi, uid: string): Promise<CmConfig | null> {
  const key = `${CM_CONFIG_PREFIX}${uid}`;
  const row = await strapi.db.query('strapi::core-store').findOne({ where: { key } });
  if (!row?.value) return null;
  try {
    return typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
  } catch {
    return null;
  }
}

async function saveCmConfig(strapi: Core.Strapi, uid: string, config: CmConfig) {
  const key = `${CM_CONFIG_PREFIX}${uid}`;
  const value = JSON.stringify(config);
  const existing = await strapi.db.query('strapi::core-store').findOne({ where: { key } });
  if (existing) {
    await strapi.db.query('strapi::core-store').update({
      where: { id: existing.id },
      data: { value },
    });
  } else {
    await strapi.db.query('strapi::core-store').create({ data: { key, value, type: 'object' } });
  }
}

/**
 * Sets Persian field labels in Content Manager configuration (metadata.label).
 * CM uses these as defaultMessage when rendering edit/list views.
 */
export async function ensureCmPersianLabels(strapi: Core.Strapi) {
  try {
    const productUid = 'plugin::webbycommerce.product';
    const productConfig = await loadCmConfig(strapi, productUid);
    if (productConfig) {
      applyLabels(productConfig, PRODUCT_LABELS);
      ensureProductLayoutFields(productConfig);
      await saveCmConfig(strapi, productUid, productConfig);
    }

    const navUid = 'api::nav-category.nav-category';
    const navConfig = await loadCmConfig(strapi, navUid);
    if (navConfig) {
      applyLabels(navConfig, NAV_CATEGORY_LABELS);
      await saveCmConfig(strapi, navUid, navConfig);
    }

    strapi.log.info('[gandom] Content Manager Persian labels synced (product, nav-category)');
  } catch (e) {
    strapi.log.warn('[gandom] ensureCmPersianLabels', e);
  }
}
