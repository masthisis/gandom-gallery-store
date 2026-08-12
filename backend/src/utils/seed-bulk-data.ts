/**
 * Programmatic large-scale demo catalog for local / QA seeding.
 * Enable with GANDOM_BULK_SEED=true (see docker-compose.yml).
 */

export const BULK_ROOT_COUNT = 20;
export const BULK_SUBS_PER_ROOT = 50;
export const BULK_PRODUCTS_PER_ROOT = 10;
export const BULK_CUSTOMER_COUNT = 100;

export type Spec = { label: string; value: string };

export type CatSeed = {
  name: string;
  slug: string;
  description?: string;
  menu_order?: number;
  imageUrl?: string;
  imageAsset?: string;
  skipImage?: boolean;
  children?: CatSeed[];
};

export type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  categorySlug: string;
  categorySlugs?: string[];
  weight?: number;
  specifications: Spec[];
  imageUrls: string[];
  imageAssets?: string[];
};

export type CustomerSeed = {
  phone: string;
  first_name: string;
  last_name: string;
  display_name: string;
  city: string;
  address: string;
  postcode: string;
};

export type ReviewSeed = {
  phone: string;
  productSlug: string;
  rating: number;
  review: string;
};

export type OrderSeed = {
  order_number: string;
  phone: string;
  status: string;
  payment_status: string;
  productSlugs: string[];
  notes: string;
};

export type FavoriteSeed = { phone: string; slug: string };

export type CommentSeed = {
  phone: string;
  slug: string;
  rating: number;
  body: string;
};

export type BulkSeedCatalog = {
  categoryTree: CatSeed[];
  products: ProductSeed[];
  customers: CustomerSeed[];
  reviewSeeds: ReviewSeed[];
  orderSamples: OrderSeed[];
  favorites: FavoriteSeed[];
  comments: CommentSeed[];
};

const IMAGE_IDS = [
  1090638, 2693529, 4207785, 1571460, 3738085, 931177, 18105, 102127, 1350789, 1191710,
  4207892, 1080696, 1575329, 205421, 1229861,
];

const ROOT_NAMES = [
  'خانه و آشپزخانه',
  'هنر و گالری',
  'هدیه و مناسبت',
  'دیجیتال و لوازم جانبی',
  'مد و پوشاک',
  'زیورآلات',
  'کتاب و لوازم تحریر',
  'ورزش و سفر',
  'زیبایی و سلامت',
  'کودک و نوزاد',
  'باغ و حیاط',
  'مبلمان',
  'روشنایی',
  'فرش و کفپوش',
  'آینه و قاب',
  'عطر و خوشبوکننده',
  'چای و قهوه',
  'صنایع دستی',
  'موسیقی و سرگرمی',
  'لوازم اداری',
];

const SUB_PREFIXES = ['مجموعه', 'کلکسیون', 'سری', 'مدل', 'دسته'];
const PRODUCT_TYPES = ['محصول', 'کالا', 'نمونه', 'طرح', 'مدل'];
const PRODUCT_ADJECTIVES = ['اصیل', 'دست‌ساز', 'ویژه', 'پریمیوم', 'کلاسیک', 'مدرن', 'مینیمال', 'لوکس'];
const CITIES = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'کرج', 'تبریز', 'رشت', 'اهواز', 'کرمان', 'یزد'];
const FIRST_NAMES = [
  'سارا', 'علی', 'مریم', 'حسین', 'نگار', 'رضا', 'فاطمه', 'امیر', 'زهرا', 'محمد',
  'نرگس', 'پارسا', 'الهام', 'کامران', 'شیدا', 'بهرام', 'آرزو', 'سینا', 'لیلا', 'دانیال',
];
const LAST_NAMES = [
  'محمدی', 'رضایی', 'کریمی', 'نوری', 'حسینی', 'احمدی', 'جعفری', 'موسوی', 'قاسمی', 'اکبری',
  'رحیمی', 'صادقی', 'کاظمی', 'ملکی', 'زارعی', 'فرهادی', 'نعمتی', 'باقری', 'شریفی', 'توکلی',
];

const REVIEW_TEXTS = [
  'کیفیت عالی و بسته‌بندی مرتب بود.',
  'راضی‌ام؛ دقیقاً مثل عکس رسید.',
  'ارسال سریع و پشتیبانی خوب.',
  'جنس خوب؛ پیشنهاد می‌کنم.',
  'برای هدیه عالی بود.',
  'قیمت مناسب نسبت به کیفیت.',
  'رنگ و جزئیات زیبا.',
  'یک بار دیگر هم سفارش می‌دهم.',
];

export function isBulkSeedEnabled(): boolean {
  return process.env.GANDOM_BULK_SEED === 'true';
}

function richDesc(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${p}</p>`).join('\n');
}

function rootSlug(index: number): string {
  return `bulk-cat-${String(index + 1).padStart(2, '0')}`;
}

function subSlug(rootIndex: number, subIndex: number): string {
  return `${rootSlug(rootIndex)}-sub-${String(subIndex + 1).padStart(2, '0')}`;
}

function productSlug(rootIndex: number, productIndex: number): string {
  return `bulk-p-${String(rootIndex * BULK_PRODUCTS_PER_ROOT + productIndex + 1).padStart(3, '0')}`;
}

function phoneForIndex(i: number): string {
  return `0912${String(i).padStart(7, '0')}`;
}

export function buildBulkSeedCatalog(
  px: (id: number | string, file?: string) => string,
  localPx: (id: number | string) => string
): BulkSeedCatalog {
  const categoryTree: CatSeed[] = [];
  const products: ProductSeed[] = [];

  for (let r = 0; r < BULK_ROOT_COUNT; r++) {
    const rootName = ROOT_NAMES[r] || `دسته ${r + 1}`;
    const rSlug = rootSlug(r);
    const imageId = IMAGE_IDS[r % IMAGE_IDS.length];
    const subSlugs: string[] = [];

    const children: CatSeed[] = [];
    for (let s = 0; s < BULK_SUBS_PER_ROOT; s++) {
      const sSlug = subSlug(r, s);
      subSlugs.push(sSlug);
      const prefix = SUB_PREFIXES[s % SUB_PREFIXES.length];
      children.push({
        name: `${prefix} ${rootName} ${s + 1}`,
        slug: sSlug,
        description: `زیردسته ${s + 1} از ${rootName}`,
        menu_order: s + 1,
        skipImage: true,
      });
    }

    categoryTree.push({
      name: rootName,
      slug: rSlug,
      description: `دسته اصلی ${rootName} — بیش از ${BULK_SUBS_PER_ROOT} زیردسته`,
      menu_order: r + 1,
      imageUrl: px(imageId),
      imageAsset: localPx(imageId),
      children,
    });

    for (let p = 0; p < BULK_PRODUCTS_PER_ROOT; p++) {
      const globalIdx = r * BULK_PRODUCTS_PER_ROOT + p;
      const pSlug = productSlug(r, p);
      const imgId = IMAGE_IDS[globalIdx % IMAGE_IDS.length];
      const type = PRODUCT_TYPES[p % PRODUCT_TYPES.length];
      const adj = PRODUCT_ADJECTIVES[(r + p) % PRODUCT_ADJECTIVES.length];
      const primarySub = subSlugs[p % subSlugs.length];
      const basePrice = 350000 + (globalIdx % 40) * 25000 + r * 10000;
      const onSale = globalIdx % 3 === 0;

      products.push({
        name: `${rootName} — ${adj} ${type} ${p + 1}`,
        slug: pSlug,
        description: richDesc([
          `${adj} ${type} از مجموعه ${rootName} با کیفیت مناسب برای استفاده روزمره.`,
          `این کالا در زیردسته ${primarySub.replace(/bulk-cat-\d+-sub-/, '')} قرار دارد و برای خرید آنلاین آماده ارسال است.`,
          'گارانتی اصالت کالا و امکان بازگشت طبق قوانین فروشگاه.',
        ]),
        price: basePrice,
        sale_price: onSale ? Math.round(basePrice * 0.85) : null,
        sku: `GD-BULK-${String(globalIdx + 1).padStart(4, '0')}`,
        stock_quantity: 5 + (globalIdx % 45),
        stock_status: 'in_stock',
        categorySlug: primarySub,
        categorySlugs: [primarySub],
        weight: 0.3 + (globalIdx % 10) * 0.15,
        specifications: [
          { label: 'دسته', value: rootName },
          { label: 'نوع', value: type },
          { label: 'ساخت', value: 'ایران' },
          { label: 'گارانتی', value: '۷ روز مهلت بازگشت' },
        ],
        imageUrls: [px(imgId)],
        imageAssets: [localPx(imgId)],
      });
    }
  }

  const customers: CustomerSeed[] = [];
  for (let i = 1; i <= BULK_CUSTOMER_COUNT; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i + 3) % LAST_NAMES.length];
    const city = CITIES[i % CITIES.length];
    customers.push({
      phone: phoneForIndex(i),
      first_name: first,
      last_name: last,
      display_name: `${first} ${last}`,
      city,
      address: `${city}، خیابان ${i}، پلاک ${(i % 90) + 10}`,
      postcode: `${1590000000 + i}`,
    });
  }

  const productSlugs = products.map((p) => p.slug);
  const reviewSeeds: ReviewSeed[] = [];
  for (let i = 0; i < 120; i++) {
    const customer = customers[i % customers.length];
    const slug = productSlugs[(i * 7) % productSlugs.length];
    reviewSeeds.push({
      phone: customer.phone,
      productSlug: slug,
      rating: 3 + (i % 3),
      review: REVIEW_TEXTS[i % REVIEW_TEXTS.length],
    });
  }

  const orderStatuses = [
    { status: 'delivered', payment_status: 'paid' },
    { status: 'processing', payment_status: 'paid' },
    { status: 'shipped', payment_status: 'paid' },
    { status: 'pending', payment_status: 'pending' },
    { status: 'delivered', payment_status: 'paid' },
  ];

  const orderSamples: OrderSeed[] = [];
  for (let i = 0; i < 40; i++) {
    const customer = customers[i % customers.length];
    const slugA = productSlugs[(i * 3) % productSlugs.length];
    const slugB = productSlugs[(i * 3 + 1) % productSlugs.length];
    const st = orderStatuses[i % orderStatuses.length];
    orderSamples.push({
      order_number: `GD-BULK-${String(10001 + i)}`,
      phone: customer.phone,
      status: st.status,
      payment_status: st.payment_status,
      productSlugs: i % 2 === 0 ? [slugA, slugB] : [slugA],
      notes: i % 4 === 0 ? 'تحویل در ساعات اداری' : '',
    });
  }

  const favorites: FavoriteSeed[] = [];
  for (let i = 0; i < 60; i++) {
    favorites.push({
      phone: customers[i % customers.length].phone,
      slug: productSlugs[(i * 5) % productSlugs.length],
    });
  }

  const comments: CommentSeed[] = [];
  for (let i = 0; i < 45; i++) {
    comments.push({
      phone: customers[(i + 10) % customers.length].phone,
      slug: productSlugs[(i * 11) % productSlugs.length],
      rating: 3 + (i % 3),
      body: REVIEW_TEXTS[(i + 2) % REVIEW_TEXTS.length],
    });
  }

  return {
    categoryTree,
    products,
    customers,
    reviewSeeds,
    orderSamples,
    favorites,
    comments,
  };
}

export function bulkSeedSummary(catalog: BulkSeedCatalog): string {
  const subs = BULK_ROOT_COUNT * BULK_SUBS_PER_ROOT;
  return (
    `${catalog.products.length} products, ${BULK_ROOT_COUNT} categories, ${subs} subcategories, ` +
    `${catalog.customers.length} customers, ${catalog.orderSamples.length} orders`
  );
}
