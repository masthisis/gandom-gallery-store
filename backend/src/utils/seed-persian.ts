import type { Core } from '@strapi/strapi';

type Spec = { label: string; value: string };
type CatSeed = {
  name: string;
  slug: string;
  description?: string;
  menu_order?: number;
  children?: CatSeed[];
};

const categoryTree: CatSeed[] = [
  {
    name: 'خانه و آشپزخانه',
    slug: 'home-kitchen',
    menu_order: 1,
    children: [
      { name: 'دکوری', slug: 'decor', description: 'آیتم‌های دکوری خانه', menu_order: 1 },
      { name: 'آشپزخانه', slug: 'kitchen', description: 'لوازم آشپزخانه', menu_order: 2 },
    ],
  },
  {
    name: 'هنر و گالری',
    slug: 'art-gallery',
    menu_order: 2,
    children: [
      { name: 'هنری', slug: 'art', description: 'آثار هنری', menu_order: 1 },
      { name: 'تابلو', slug: 'canvas', description: 'تابلو و چاپ', menu_order: 2 },
    ],
  },
  {
    name: 'هدیه و مناسبت',
    slug: 'gifts',
    menu_order: 3,
    children: [
      { name: 'هدیه', slug: 'gift', description: 'پیشنهاد هدیه', menu_order: 1 },
      { name: 'لوازم جانبی', slug: 'accessories', description: 'اکسسوری', menu_order: 2 },
    ],
  },
  {
    name: 'دیجیتال',
    slug: 'digital',
    menu_order: 4,
    children: [{ name: 'لپ‌تاپ', slug: 'laptop', description: 'لپ‌تاپ و نوت‌بوک', menu_order: 1 }],
  },
];

const products: Array<{
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  stock_status: string;
  categorySlug: string;
  specifications: Spec[];
  gallery_urls: string[];
}> = [
  {
    name: 'گلدان سرامیکی گندم',
    slug: 'ceramic-vase-gandom',
    description:
      'گلدان دست‌ساز سرامیکی با لعاب مات. مناسب دکوراسیون میز و کنسول. ارتفاع حدود ۳۰ سانتی‌متر.',
    price: 890000,
    sale_price: 750000,
    sku: 'GD-VAS-001',
    stock_quantity: 25,
    stock_status: 'in_stock',
    categorySlug: 'decor',
    specifications: [
      { label: 'جنس', value: 'سرامیک' },
      { label: 'ارتفاع', value: '۳۰ سانتی‌متر' },
      { label: 'رنگ', value: 'کرم مات' },
      { label: 'ساخت', value: 'ایران' },
    ],
    gallery_urls: [
      '/products/ceramic-vase-v1.svg',
      '/products/ceramic-vase-v2.svg',
      '/products/ceramic-vase-v3.svg',
    ],
  },
  {
    name: 'تابلو نقاشی مینیمال',
    slug: 'minimal-canvas',
    description: 'تابلو چاپی مینیمال روی بوم. مناسب فضای مدرن و مینیمال.',
    price: 1200000,
    sale_price: null,
    sku: 'GD-ART-002',
    stock_quantity: 12,
    stock_status: 'in_stock',
    categorySlug: 'art',
    specifications: [
      { label: 'ابعاد', value: '۵۰×۷۰ سانتی‌متر' },
      { label: 'جنس', value: 'بوم چاپی' },
      { label: 'قاب', value: 'چوب طبیعی' },
      { label: 'سبک', value: 'مینیمال' },
    ],
    gallery_urls: ['/products/minimal-canvas-v1.svg', '/products/minimal-canvas-v2.svg'],
  },
  {
    name: 'ست شمع معطر',
    slug: 'scented-candle-set',
    description: 'ست سه عددی شمع با رایحه ملایم وانیل و چوب صندل.',
    price: 450000,
    sale_price: 390000,
    sku: 'GD-GIF-003',
    stock_quantity: 40,
    stock_status: 'in_stock',
    categorySlug: 'gift',
    specifications: [
      { label: 'تعداد', value: '۳ عدد' },
      { label: 'رایحه', value: 'وانیل / صندل' },
      { label: 'زمان سوختن', value: 'حدود ۲۵ ساعت' },
    ],
    gallery_urls: ['/products/scented-candle-v1.svg', '/products/scented-candle-v2.svg'],
  },
  {
    name: 'آویز برنجی',
    slug: 'brass-pendant',
    description: 'آویز تزئینی برنجی ساخت ایران، مناسب هدیه.',
    price: 320000,
    sale_price: null,
    sku: 'GD-ACC-004',
    stock_quantity: 30,
    stock_status: 'in_stock',
    categorySlug: 'accessories',
    specifications: [
      { label: 'جنس', value: 'برنج' },
      { label: 'طول زنجیر', value: '۴۵ سانتی‌متر' },
      { label: 'ساخت', value: 'ایران' },
    ],
    gallery_urls: ['/products/brass-pendant-v1.svg', '/products/brass-pendant-v2.svg'],
  },
  {
    name: 'کوسن گالری',
    slug: 'gallery-cushion',
    description: 'کوسن مخمل با طرح اختصاصی گندم گالری.',
    price: 280000,
    sale_price: 240000,
    sku: 'GD-DEC-005',
    stock_quantity: 50,
    stock_status: 'in_stock',
    categorySlug: 'decor',
    specifications: [
      { label: 'ابعاد', value: '۴۵×۴۵ سانتی‌متر' },
      { label: 'جنس رویه', value: 'مخمل' },
      { label: 'قابل شستشو', value: 'بله' },
    ],
    gallery_urls: ['/products/gallery-cushion-v1.svg', '/products/gallery-cushion-v2.svg'],
  },
  {
    name: 'مجسمه سفالی کوچک',
    slug: 'small-clay-sculpture',
    description: 'مجسمه سفالی دست‌ساز با پرداخت طبیعی.',
    price: 650000,
    sale_price: null,
    sku: 'GD-ART-006',
    stock_quantity: 8,
    stock_status: 'in_stock',
    categorySlug: 'art',
    specifications: [
      { label: 'جنس', value: 'سفال' },
      { label: 'ارتفاع', value: '۱۸ سانتی‌متر' },
      { label: 'دست‌ساز', value: 'بله' },
    ],
    gallery_urls: ['/products/clay-sculpture-v1.svg', '/products/clay-sculpture-v2.svg'],
  },
  {
    name: 'سرویس چای‌خوری',
    slug: 'tea-set',
    description: 'سرویس چای‌خوری ۴ نفره سرامیکی با نقاشی دستی.',
    price: 980000,
    sale_price: 850000,
    sku: 'GD-KIT-007',
    stock_quantity: 15,
    stock_status: 'in_stock',
    categorySlug: 'kitchen',
    specifications: [
      { label: 'تعداد نفرات', value: '۴ نفره' },
      { label: 'جنس', value: 'سرامیک' },
      { label: 'قابلیت ماشین ظرفشویی', value: 'خیر' },
    ],
    gallery_urls: [
      '/products/tea-set-v1.svg',
      '/products/tea-set-v2.svg',
      '/products/tea-set-v3.svg',
    ],
  },
  {
    name: 'تابلو خطاطی',
    slug: 'calligraphy-canvas',
    description: 'تابلو خطاطی مدرن با قاب چوبی.',
    price: 1500000,
    sale_price: null,
    sku: 'GD-CAN-008',
    stock_quantity: 6,
    stock_status: 'in_stock',
    categorySlug: 'canvas',
    specifications: [
      { label: 'ابعاد', value: '۶۰×۹۰ سانتی‌متر' },
      { label: 'خط', value: 'نستعلیق' },
      { label: 'قاب', value: 'چوب راش' },
    ],
    gallery_urls: ['/products/calligraphy-v1.svg', '/products/calligraphy-v2.svg'],
  },
  {
    name: 'لپ‌تاپ گندم بوک ۱۵',
    slug: 'gandom-book-15',
    description:
      'لپ‌تاپ ۱۵ اینچی مناسب کار و دانشجویی با پردازنده Intel Core i5 و حافظه ۱۶ گیگابایت.',
    price: 28500000,
    sale_price: 26900000,
    sku: 'GD-LAP-009',
    stock_quantity: 10,
    stock_status: 'in_stock',
    categorySlug: 'laptop',
    specifications: [
      { label: 'پردازنده', value: 'Intel Core i5' },
      { label: 'رم', value: '۱۶ گیگابایت' },
      { label: 'حافظه', value: '۵۱۲ گیگابایت SSD' },
      { label: 'صفحه نمایش', value: '۱۵.۶ اینچ Full HD' },
      { label: 'سیستم‌عامل', value: 'Windows 11' },
    ],
    gallery_urls: [
      '/products/tea-set-v1.svg',
      '/products/tea-set-v2.svg',
      '/products/minimal-canvas-v1.svg',
    ],
  },
  {
    name: 'لپ‌تاپ گندم بوک پرو',
    slug: 'gandom-book-pro',
    description: 'لپ‌تاپ حرفه‌ای با پردازنده AMD Ryzen 7 مناسب طراحی و تدوین.',
    price: 42000000,
    sale_price: null,
    sku: 'GD-LAP-010',
    stock_quantity: 5,
    stock_status: 'in_stock',
    categorySlug: 'laptop',
    specifications: [
      { label: 'پردازنده', value: 'AMD Ryzen 7' },
      { label: 'رم', value: '۳۲ گیگابایت' },
      { label: 'حافظه', value: '۱ ترابایت SSD' },
      { label: 'صفحه نمایش', value: '۱۶ اینچ QHD' },
      { label: 'سیستم‌عامل', value: 'Windows 11' },
    ],
    gallery_urls: ['/products/calligraphy-v1.svg', '/products/clay-sculpture-v1.svg'],
  },
];

const customers = [
  { phone: '09121111111', first_name: 'سارا', last_name: 'محمدی', display_name: 'سارا محمدی' },
  { phone: '09122222222', first_name: 'علی', last_name: 'رضایی', display_name: 'علی رضایی' },
  { phone: '09123333333', first_name: 'مریم', last_name: 'کریمی', display_name: 'مریم کریمی' },
  { phone: '09124444444', first_name: 'حسین', last_name: 'نوری', display_name: 'حسین نوری' },
];

const reviewSeeds: Array<{ phone: string; productSlug: string; rating: number; review: string }> = [
  {
    phone: '09121111111',
    productSlug: 'ceramic-vase-gandom',
    rating: 5,
    review: 'گلدان خیلی زیبا و باکیفیت بود. بسته‌بندی عالی.',
  },
  {
    phone: '09122222222',
    productSlug: 'ceramic-vase-gandom',
    rating: 4,
    review: 'رنگ کمی روشن‌تر از عکس بود ولی راضی‌ام.',
  },
  {
    phone: '09123333333',
    productSlug: 'minimal-canvas',
    rating: 5,
    review: 'تابلو مینیمال عالی برای اتاق کارم.',
  },
  {
    phone: '09124444444',
    productSlug: 'gandom-book-15',
    rating: 4,
    review: 'لپ‌تاپ Intel i5 برای کار روزمره کاملاً مناسب است.',
  },
  {
    phone: '09121111111',
    productSlug: 'tea-set',
    rating: 5,
    review: 'سرویس چای‌خوری شیک و کاربردی.',
  },
  {
    phone: '09122222222',
    productSlug: 'gandom-book-pro',
    rating: 5,
    review: 'Ryzen 7 برای تدوین ویدیو عالی کار می‌کند.',
  },
  {
    phone: '09123333333',
    productSlug: 'scented-candle-set',
    rating: 4,
    review: 'رایحه ملایم و ماندگار.',
  },
  {
    phone: '09124444444',
    productSlug: 'gallery-cushion',
    rating: 5,
    review: 'کوسن نرم و طرح قشنگ.',
  },
];

const pages = [
  { title: 'درباره ما', slug: 'about', body: 'گندم گالری، فروشگاهی کامل برای خرید آنلاین با ارسال سریع.' },
  { title: 'تماس با ما', slug: 'contact', body: 'پشتیبانی: ۰۲۱۹۱۰۰۰۰۰۰' },
  { title: 'ارسال و تحویل', slug: 'shipping', body: 'ارسال به سراسر ایران طی ۲ تا ۵ روز کاری.' },
  { title: 'بازگشت کالا', slug: 'returns', body: 'امکان بازگشت تا ۷ روز پس از دریافت.' },
  { title: 'حریم خصوصی', slug: 'privacy', body: 'اطلاعات شما محرمانه نزد ما محفوظ است.' },
  { title: 'قوانین و مقررات', slug: 'terms', body: 'قوانین استفاده از فروشگاه گندم گالری.' },
  { title: 'سوالات متداول', slug: 'faq', body: 'چگونه سفارش ثبت کنم؟ با شماره موبایل وارد شوید و پرداخت کنید.' },
];

async function upsertNavCategory(
  strapi: Core.Strapi,
  c: CatSeed,
  parentId: number | null,
  navMap: Record<string, any>
) {
  let existing = await strapi.db.query('api::nav-category.nav-category').findOne({
    where: { slug: c.slug },
  });
  const data: any = {
    name: c.name,
    slug: c.slug,
    commerceSlug: c.slug,
    description: c.description || '',
    menu_order: c.menu_order ?? 0,
    show_in_menu: true,
    publishedAt: new Date(),
  };
  if (parentId) data.parent = parentId;

  if (!existing) {
    existing = await strapi.db.query('api::nav-category.nav-category').create({ data });
  } else {
    existing = await strapi.db.query('api::nav-category.nav-category').update({
      where: { id: existing.id },
      data: {
        menu_order: data.menu_order,
        show_in_menu: true,
        commerceSlug: c.slug,
        parent: parentId || null,
      },
    });
  }
  navMap[c.slug] = existing;
  for (const child of c.children || []) {
    await upsertNavCategory(strapi, child, existing.id, navMap);
  }
}

async function ensureCustomer(strapi: Core.Strapi, c: (typeof customers)[0]) {
  const existing = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { phone_no: c.phone },
  });
  if (existing) return existing;

  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });
  return strapi.plugin('users-permissions').service('user').add({
    username: `u${c.phone.slice(-8)}`,
    email: `${c.phone}@users.gandom.local`,
    password: 'Gandom123!',
    phone_no: c.phone,
    first_name: c.first_name,
    last_name: c.last_name,
    display_name: c.display_name,
    confirmed: true,
    blocked: false,
    provider: 'local',
    role: role?.id,
  });
}

async function upsertProductMeta(
  strapi: Core.Strapi,
  slug: string,
  specifications: Spec[],
  gallery_urls: string[]
) {
  const existing = await strapi.db.query('api::product-meta.product-meta').findOne({
    where: { productSlug: slug },
  });
  const data = { productSlug: slug, specifications, gallery_urls };
  if (!existing) {
    await strapi.db.query('api::product-meta.product-meta').create({ data });
  } else {
    await strapi.db.query('api::product-meta.product-meta').update({
      where: { id: existing.id },
      data,
    });
  }
}

export async function seedPersianCatalog(strapi: Core.Strapi) {
  const catMap: Record<string, any> = {};

  const flatCats = [
    { name: 'دکوری', slug: 'decor', description: 'آیتم‌های دکوری خانه' },
    { name: 'آشپزخانه', slug: 'kitchen', description: 'لوازم آشپزخانه' },
    { name: 'هنری', slug: 'art', description: 'آثار هنری' },
    { name: 'تابلو', slug: 'canvas', description: 'تابلو و چاپ' },
    { name: 'هدیه', slug: 'gift', description: 'پیشنهاد هدیه' },
    { name: 'لوازم جانبی', slug: 'accessories', description: 'اکسسوری' },
    { name: 'لپ‌تاپ', slug: 'laptop', description: 'لپ‌تاپ و نوت‌بوک' },
  ];
  for (const c of flatCats) {
    let existing = await strapi.db.query('plugin::webbycommerce.product-category').findOne({
      where: { slug: c.slug },
    });
    if (!existing) {
      existing = await strapi.db.query('plugin::webbycommerce.product-category').create({
        data: { ...c, publishedAt: new Date() },
      });
    }
    catMap[c.slug] = existing;
  }

  try {
    const navMap: Record<string, any> = {};
    for (const root of categoryTree) {
      await upsertNavCategory(strapi, root, null, navMap);
    }
  } catch (e) {
    strapi.log.warn('[gandom] nav-category seed', e);
  }

  for (const p of products) {
    const { categorySlug, specifications, gallery_urls, ...rest } = p;
    let existing = await strapi.db.query('plugin::webbycommerce.product').findOne({
      where: { slug: p.slug },
    });
    if (!existing) {
      const data: any = {
        ...rest,
        product_categories: catMap[categorySlug] ? [catMap[categorySlug].id] : [],
        publishedAt: new Date(),
      };
      try {
        data.specifications = specifications;
        data.gallery_urls = gallery_urls;
      } catch {
        /* fields may not exist */
      }
      existing = await strapi.db.query('plugin::webbycommerce.product').create({ data });
    } else {
      try {
        await strapi.db.query('plugin::webbycommerce.product').update({
          where: { id: existing.id },
          data: {
            description: rest.description,
            specifications,
            gallery_urls,
            price: rest.price,
            sale_price: rest.sale_price,
            stock_quantity: rest.stock_quantity,
          },
        });
      } catch {
        try {
          await strapi.db.query('plugin::webbycommerce.product').update({
            where: { id: existing.id },
            data: {
              description: rest.description,
              price: rest.price,
              sale_price: rest.sale_price,
            },
          });
        } catch {
          /* ignore */
        }
      }
    }

    try {
      await upsertProductMeta(strapi, p.slug, specifications, gallery_urls);
    } catch (e) {
      strapi.log.warn('[gandom] product-meta', p.slug, e);
    }
  }

  const userByPhone: Record<string, any> = {};
  for (const c of customers) {
    try {
      userByPhone[c.phone] = await ensureCustomer(strapi, c);
    } catch (e) {
      strapi.log.warn('[gandom] customer seed', c.phone, e);
    }
  }

  for (const r of reviewSeeds) {
    try {
      const product = await strapi.db.query('plugin::webbycommerce.product').findOne({
        where: { slug: r.productSlug },
      });
      const user = userByPhone[r.phone];
      if (!product || !user) continue;
      const existing = await strapi.db.query('plugin::webbycommerce.product-review').findOne({
        where: { product: product.id, user: user.id },
      });
      if (existing) continue;
      await strapi.db.query('plugin::webbycommerce.product-review').create({
        data: {
          review: r.review,
          rating: r.rating,
          is_visible: true,
          product: product.id,
          user: user.id,
        },
      });
    } catch (e) {
      strapi.log.warn('[gandom] review seed', r.productSlug, e);
    }
  }

  for (const page of pages) {
    const existing = await strapi.documents('api::page.page').findMany({
      filters: { slug: page.slug },
    });
    if (existing?.length) continue;
    await strapi.documents('api::page.page').create({
      data: { ...page, publishedAt: new Date() },
    });
  }

  strapi.log.info('[gandom] Persian seed completed (products+specs+users+reviews)');
}

export async function seedHomepageSections(strapi: Core.Strapi) {
  try {
    const home = await strapi.documents('api::homepage.homepage').findFirst({});
    const sectionsPayload: any[] = [
      {
        __component: 'sections.hero-slider',
        slides: [
          {
            title: 'به گندم گالری خوش آمدید',
            subtitle: 'فروشگاه کامل آنلاین با ارسال سریع',
            imageUrl: '',
            link: '/shop',
          },
        ],
      },
      {
        __component: 'sections.story-row',
        items: [
          { title: 'شگفت‌انگیز', link: '/shop?sort=sale', color: '#ef4056' },
          { title: 'دکوری', link: '/category/decor', color: '#19bfd3' },
          { title: 'لپ‌تاپ', link: '/category/laptop', color: '#6366f1' },
          { title: 'هدیه', link: '/category/gift', color: '#f9a825' },
          { title: 'همه کالاها', link: '/shop', color: '#3f4064' },
        ],
      },
      {
        __component: 'sections.incredible-offers',
        title: 'پیشنهاد شگفت‌انگیز',
        themeColor: '#ef4056',
        source: 'sale',
        limit: 8,
      },
      {
        __component: 'sections.category-grid',
        title: 'دسته‌بندی‌ها',
        categorySlugs: '',
      },
      {
        __component: 'sections.banner-grid',
        columns: '2',
        banners: [
          { title: 'دکوری خانه', link: '/category/decor', imageUrl: '' },
          { title: 'لپ‌تاپ‌ها', link: '/category/laptop', imageUrl: '' },
        ],
      },
      {
        __component: 'sections.product-row',
        title: 'جدیدترین‌ها',
        source: 'newest',
        limit: 8,
        link: '/shop?sort=newest',
      },
      {
        __component: 'sections.trust-badges',
        items: [
          { title: 'ارسال سریع', text: 'به سراسر ایران' },
          { title: 'ضمانت اصالت', text: 'کالای اصل' },
          { title: '۷ روز بازگشت', text: 'بدون دردسر' },
          { title: 'پشتیبانی', text: 'همه‌روزه' },
        ],
      },
    ];

    if (!home) {
      await strapi.documents('api::homepage.homepage').create({
        status: 'published',
        data: {
          seoTitle: 'گندم گالری | فروشگاه آنلاین',
          seoDescription: 'خرید آسان از گندم گالری',
          sections: sectionsPayload,
        } as any,
      });
      return;
    }

    const homeAny = home as any;
    const current = homeAny.sections;
    const isLegacyJson =
      Array.isArray(current) &&
      current.length > 0 &&
      current[0] &&
      typeof current[0] === 'object' &&
      !('__component' in (current[0] as object)) &&
      'type' in (current[0] as object);
    const isEmpty = !current || (Array.isArray(current) && current.length === 0);

    if (isEmpty || isLegacyJson) {
      await strapi.documents('api::homepage.homepage').update({
        documentId: home.documentId,
        status: 'published',
        data: {
          seoTitle: home.seoTitle || 'گندم گالری | فروشگاه آنلاین',
          seoDescription: home.seoDescription || 'خرید آسان از گندم گالری',
          sections: sectionsPayload,
        } as any,
      });
      strapi.log.info('[gandom] Homepage dynamic-zone sections seeded');
    } else if (home.documentId) {
      await strapi.documents('api::homepage.homepage').publish({
        documentId: home.documentId,
      });
    }
  } catch (e) {
    strapi.log.warn('[gandom] seedHomepageSections', e);
  }
}
