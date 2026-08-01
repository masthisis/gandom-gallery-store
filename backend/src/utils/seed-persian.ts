import type { Core } from '@strapi/strapi';
import { uploadSeedImage } from './seed-upload';

/** Pexels CDN — downloaded into Strapi Media Library at seed time. */
const px = (id: number | string, file?: string) => {
  const fname = file || `pexels-photo-${id}.jpeg`;
  return `https://images.pexels.com/photos/${id}/${fname}?auto=compress&cs=tinysrgb&w=1200`;
};

type Spec = { label: string; value: string };
type CatSeed = {
  name: string;
  slug: string;
  description?: string;
  menu_order?: number;
  imageUrl?: string;
  imageAsset?: string;
  children?: CatSeed[];
};

const categoryTree: CatSeed[] = [
  {
    name: 'خانه و آشپزخانه',
    slug: 'home-kitchen',
    description: 'لوازم دکوری و آشپزخانه برای خانه‌ای زیباتر',
    menu_order: 1,
    imageUrl: px(1080696),
    imageAsset: 'downloaded/home-kitchen.jpg',
    children: [
      {
        name: 'دکوری',
        slug: 'decor',
        description: 'گلدان، کوسن و اشیای دکوری',
        menu_order: 1,
        imageUrl: px(1571460),
        imageAsset: 'downloaded/decor.jpg',
      },
      {
        name: 'آشپزخانه',
        slug: 'kitchen',
        description: 'سرویس و لوازم سرو غذا و نوشیدنی',
        menu_order: 2,
        imageUrl: px(3738085),
        imageAsset: 'categories/kitchen.svg',
      },
    ],
  },
  {
    name: 'هنر و گالری',
    slug: 'art-gallery',
    description: 'آثار هنری و تابلو برای فضای مدرن',
    menu_order: 2,
    imageUrl: px(1575329),
    imageAsset: 'downloaded/art-gallery.jpg',
    children: [
      {
        name: 'هنری',
        slug: 'art',
        description: 'مجسمه و آثار هنری دست‌ساز',
        menu_order: 1,
        imageUrl: px(2693529),
        imageAsset: 'categories/art.svg',
      },
      {
        name: 'تابلو',
        slug: 'canvas',
        description: 'تابلو نقاشی و خطاطی',
        menu_order: 2,
        imageUrl: px(102127),
        imageAsset: 'categories/canvas.svg',
      },
    ],
  },
  {
    name: 'هدیه و مناسبت',
    slug: 'gifts',
    description: 'انتخاب هدیه برای هر مناسبت',
    menu_order: 3,
    imageUrl: px(1191710),
    imageAsset: 'categories/gifts.svg',
    children: [
      {
        name: 'هدیه',
        slug: 'gift',
        description: 'پیشنهادهای هدیه آماده',
        menu_order: 1,
        imageUrl: px(931177),
        imageAsset: 'categories/gift.svg',
      },
      {
        name: 'لوازم جانبی',
        slug: 'accessories',
        description: 'اکسسوری و زیورآلات تزئینی',
        menu_order: 2,
        imageUrl: px(1191531),
        imageAsset: 'categories/accessories.svg',
      },
    ],
  },
  {
    name: 'دیجیتال',
    slug: 'digital',
    description: 'لپ‌تاپ و تجهیزات دیجیتال',
    menu_order: 4,
    imageUrl: px(205421),
    imageAsset: 'categories/digital.svg',
    children: [
      {
        name: 'لپ‌تاپ',
        slug: 'laptop',
        description: 'لپ‌تاپ دانشجویی و حرفه‌ای',
        menu_order: 1,
        imageUrl: px(18105, 'pexels-photo.jpg'),
        imageAsset: 'categories/laptop.svg',
      },
    ],
  },
];

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  categorySlug: string;
  weight?: number;
  specifications: Spec[];
  imageUrls: string[];
  /** Local fallbacks if download fails (optional). */
  imageAssets?: string[];
};

function richDesc(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${p}</p>`).join('\n');
}

const products: ProductSeed[] = [
  {
    name: 'گلدان سرامیکی گندم',
    slug: 'ceramic-vase-gandom',
    description: richDesc([
      'گلدان دست‌ساز سرامیکی با لعاب مات کرم؛ انتخابی شیک برای میز کنسول، شومینه یا میز ناهارخوری.',
      'ارتفاع حدود ۳۰ سانتی‌متر است و به‌خاطر پایه پایدار، برای گل‌های خشک و شاخه‌های تزئینی مناسب است.',
      'هر قطعه به‌صورت محدود تولید می‌شود و جزئیات لعاب ممکن است کمی متفاوت باشد — این بخشی از زیبایی کار دست است.',
    ]),
    price: 890000,
    sale_price: 750000,
    sku: 'GD-VAS-001',
    stock_quantity: 25,
    stock_status: 'in_stock',
    categorySlug: 'decor',
    weight: 1.2,
    specifications: [
      { label: 'جنس', value: 'سرامیک' },
      { label: 'ارتفاع', value: '۳۰ سانتی‌متر' },
      { label: 'رنگ', value: 'کرم مات' },
      { label: 'ساخت', value: 'ایران' },
      { label: 'قابل شستشو', value: 'با دست' },
    ],
    imageUrls: [
      px(1090638),
      px(2693529),
      px(4207785),
    ],
    imageAssets: ['products/ceramic-vase-v1.svg', 'products/ceramic-vase-v2.svg', 'products/ceramic-vase-v3.svg'],
  },
  {
    name: 'تابلو نقاشی مینیمال',
    slug: 'minimal-canvas',
    description: richDesc([
      'تابلو چاپی مینیمال روی بوم با قاب چوب طبیعی؛ مناسب اتاق کار، پذیرایی و فضاهای مدرن.',
      'ابعاد ۵۰×۷۰ سانتی‌متر بوده و آماده‌ی نصب است. رنگ‌ها برای نور طبیعی و مصنوعی تنظیم شده‌اند.',
    ]),
    price: 1200000,
    sale_price: null,
    sku: 'GD-ART-002',
    stock_quantity: 12,
    stock_status: 'in_stock',
    categorySlug: 'art',
    weight: 1.8,
    specifications: [
      { label: 'ابعاد', value: '۵۰×۷۰ سانتی‌متر' },
      { label: 'جنس', value: 'بوم چاپی' },
      { label: 'قاب', value: 'چوب طبیعی' },
      { label: 'سبک', value: 'مینیمال' },
    ],
    imageUrls: [px(1572386), px(102127)],
    imageAssets: ['products/minimal-canvas-v1.svg', 'products/minimal-canvas-v2.svg'],
  },
  {
    name: 'ست شمع معطر',
    slug: 'scented-candle-set',
    description: richDesc([
      'ست سه عددی شمع گیاهی با رایحه ملایم وانیل و چوب صندل؛ مناسب هدیه و آرامش فضای خانه.',
      'زمان سوختن هر شمع حدود ۲۵ ساعت است و ظرف شیشه‌ای آن قابل استفاده مجدد می‌باشد.',
    ]),
    price: 450000,
    sale_price: 390000,
    sku: 'GD-GIF-003',
    stock_quantity: 40,
    stock_status: 'in_stock',
    categorySlug: 'gift',
    weight: 0.7,
    specifications: [
      { label: 'تعداد', value: '۳ عدد' },
      { label: 'رایحه', value: 'وانیل / صندل' },
      { label: 'زمان سوختن', value: 'حدود ۲۵ ساعت' },
      { label: 'جنس موم', value: 'سویا' },
    ],
    imageUrls: [px(4207892), px(374885)],
    imageAssets: ['products/scented-candle-v1.svg', 'products/scented-candle-v2.svg'],
  },
  {
    name: 'آویز برنجی',
    slug: 'brass-pendant',
    description: richDesc([
      'آویز تزئینی برنجی ساخت ایران با پرداخت دستی؛ هدیه‌ای سبک و خاص برای دوستان و خانواده.',
      'طول زنجیر ۴۵ سانتی‌متر است و قفل آن از نوع فنری مطمئن انتخاب شده است.',
    ]),
    price: 320000,
    sale_price: null,
    sku: 'GD-ACC-004',
    stock_quantity: 30,
    stock_status: 'in_stock',
    categorySlug: 'accessories',
    weight: 0.15,
    specifications: [
      { label: 'جنس', value: 'برنج' },
      { label: 'طول زنجیر', value: '۴۵ سانتی‌متر' },
      { label: 'ساخت', value: 'ایران' },
    ],
    imageUrls: [px(1191531), px(604426)],
    imageAssets: ['products/brass-pendant-v1.svg', 'products/brass-pendant-v2.svg'],
  },
  {
    name: 'کوسن گالری',
    slug: 'gallery-cushion',
    description: richDesc([
      'کوسن مخمل ۴۵×۴۵ با طرح اختصاصی گندم گالری؛ نرمی بالا و ظاهر لوکس برای مبل و تخت.',
      'رویه قابل جدا شدن و شستشو است. الیاف داخلی ضدحساسیت می‌باشد.',
    ]),
    price: 280000,
    sale_price: 240000,
    sku: 'GD-DEC-005',
    stock_quantity: 50,
    stock_status: 'in_stock',
    categorySlug: 'decor',
    weight: 0.45,
    specifications: [
      { label: 'ابعاد', value: '۴۵×۴۵ سانتی‌متر' },
      { label: 'جنس رویه', value: 'مخمل' },
      { label: 'قابل شستشو', value: 'بله' },
    ],
    imageUrls: [px(1123262), px(1571460)],
    imageAssets: ['products/gallery-cushion-v1.svg', 'products/gallery-cushion-v2.svg'],
  },
  {
    name: 'مجسمه سفالی کوچک',
    slug: 'small-clay-sculpture',
    description: richDesc([
      'مجسمه سفالی دست‌ساز با پرداخت طبیعی؛ قطعه‌ای هنری برای شلف کتابخانه یا میز کار.',
      'ارتفاع حدود ۱۸ سانتی‌متر است. به دلیل ماهیت دست‌ساز، بافت هر قطعه یکتا است.',
    ]),
    price: 650000,
    sale_price: null,
    sku: 'GD-ART-006',
    stock_quantity: 8,
    stock_status: 'in_stock',
    categorySlug: 'art',
    weight: 0.9,
    specifications: [
      { label: 'جنس', value: 'سفال' },
      { label: 'ارتفاع', value: '۱۸ سانتی‌متر' },
      { label: 'دست‌ساز', value: 'بله' },
    ],
    imageUrls: [px(2693529), px(6065420)],
    imageAssets: ['products/clay-sculpture-v1.svg', 'products/clay-sculpture-v2.svg'],
  },
  {
    name: 'سرویس چای‌خوری',
    slug: 'tea-set',
    description: richDesc([
      'سرویس چای‌خوری ۴ نفره سرامیکی با نقاشی دستی؛ مناسب مهمانی‌های صمیمی و هدیه عروسی.',
      'شامل قوری، ۴ فنجان و نعلبکی است. شستشو با دست توصیه می‌شود.',
    ]),
    price: 980000,
    sale_price: 850000,
    sku: 'GD-KIT-007',
    stock_quantity: 15,
    stock_status: 'in_stock',
    categorySlug: 'kitchen',
    weight: 2.4,
    specifications: [
      { label: 'تعداد نفرات', value: '۴ نفره' },
      { label: 'جنس', value: 'سرامیک' },
      { label: 'قابلیت ماشین ظرفشویی', value: 'خیر' },
    ],
    imageUrls: [
      px(1838554),
      px(3735149),
      px(3738355),
    ],
    imageAssets: ['products/tea-set-v1.svg', 'products/tea-set-v2.svg', 'products/tea-set-v3.svg'],
  },
  {
    name: 'تابلو خطاطی',
    slug: 'calligraphy-canvas',
    description: richDesc([
      'تابلو خطاطی مدرن با قاب چوب راش؛ ترکیبی از سنت و طراحی معاصر برای دیوار پذیرایی.',
      'ابعاد ۶۰×۹۰ سانتی‌متر و خط نستعلیق با ترکیب‌بندی مینیمال.',
    ]),
    price: 1500000,
    sale_price: null,
    sku: 'GD-CAN-008',
    stock_quantity: 6,
    stock_status: 'in_stock',
    categorySlug: 'canvas',
    weight: 2.1,
    specifications: [
      { label: 'ابعاد', value: '۶۰×۹۰ سانتی‌متر' },
      { label: 'خط', value: 'نستعلیق' },
      { label: 'قاب', value: 'چوب راش' },
    ],
    imageUrls: [px(102127), px(1575329)],
    imageAssets: ['products/calligraphy-v1.svg', 'products/calligraphy-v2.svg'],
  },
  {
    name: 'لپ‌تاپ گندم بوک ۱۵',
    slug: 'gandom-book-15',
    description: richDesc([
      'لپ‌تاپ ۱۵ اینچی مناسب کار اداری و دانشجویی با پردازنده Intel Core i5 و ۱۶ گیگابایت رم.',
      'حافظه ۵۱۲ گیگابایت SSD، نمایشگر Full HD و سیستم‌عامل Windows 11 از پیش نصب شده است.',
      'گارانتی اصالت و سلامت فیزیکی کالا همراه با پشتیبانی گندم گالری ارائه می‌شود.',
    ]),
    price: 28500000,
    sale_price: 26900000,
    sku: 'GD-LAP-009',
    stock_quantity: 10,
    stock_status: 'in_stock',
    categorySlug: 'laptop',
    weight: 1.7,
    specifications: [
      { label: 'پردازنده', value: 'Intel Core i5' },
      { label: 'رم', value: '۱۶ گیگابایت' },
      { label: 'حافظه', value: '۵۱۲ گیگابایت SSD' },
      { label: 'صفحه نمایش', value: '۱۵.۶ اینچ Full HD' },
      { label: 'سیستم‌عامل', value: 'Windows 11' },
    ],
    imageUrls: [
      px(18105, 'pexels-photo.jpg'),
      px(1229861),
      px(205421),
    ],
  },
  {
    name: 'لپ‌تاپ گندم بوک پرو',
    slug: 'gandom-book-pro',
    description: richDesc([
      'لپ‌تاپ حرفه‌ای با پردازنده AMD Ryzen 7، ۳۲ گیگابایت رم و نمایشگر ۱۶ اینچ QHD.',
      'مناسب طراحی، تدوین و کارهای سنگین. حافظه ۱ ترابایت SSD فضای کافی برای پروژه‌ها فراهم می‌کند.',
    ]),
    price: 42000000,
    sale_price: null,
    sku: 'GD-LAP-010',
    stock_quantity: 5,
    stock_status: 'in_stock',
    categorySlug: 'laptop',
    weight: 1.9,
    specifications: [
      { label: 'پردازنده', value: 'AMD Ryzen 7' },
      { label: 'رم', value: '۳۲ گیگابایت' },
      { label: 'حافظه', value: '۱ ترابایت SSD' },
      { label: 'صفحه نمایش', value: '۱۶ اینچ QHD' },
      { label: 'سیستم‌عامل', value: 'Windows 11' },
    ],
    imageUrls: [px(7974, 'pexels-photo.jpg'), px(18105, 'pexels-photo.jpg')],
  },
  {
    name: 'گلدان مینیمال سفید',
    slug: 'minimal-white-vase',
    description: richDesc([
      'گلدان سرامیکی سفید مات با فرم استوانه‌ای ساده؛ ست‌شدن آسان با دکوراسیون اسکاندیناویایی.',
    ]),
    price: 520000,
    sale_price: 460000,
    sku: 'GD-VAS-011',
    stock_quantity: 18,
    stock_status: 'in_stock',
    categorySlug: 'decor',
    weight: 0.95,
    specifications: [
      { label: 'جنس', value: 'سرامیک' },
      { label: 'ارتفاع', value: '۲۴ سانتی‌متر' },
      { label: 'رنگ', value: 'سفید مات' },
    ],
    imageUrls: [px(404319), px(604426)],
    imageAssets: ['products/ceramic-vase-v2.svg', 'products/ceramic-vase-v1.svg'],
  },
  {
    name: 'ست هدیه آرامش',
    slug: 'calm-gift-box',
    description: richDesc([
      'باکس هدیه شامل شمع معطر و آویز برنجی در بسته‌بندی کادویی گندم گالری.',
    ]),
    price: 690000,
    sale_price: 620000,
    sku: 'GD-GIF-012',
    stock_quantity: 22,
    stock_status: 'in_stock',
    categorySlug: 'gift',
    weight: 0.85,
    specifications: [
      { label: 'محتویات', value: 'شمع + آویز' },
      { label: 'بسته‌بندی', value: 'جعبه کادویی' },
    ],
    imageUrls: [px(931177), px(1191710)],
    imageAssets: ['products/scented-candle-v1.svg', 'products/brass-pendant-v1.svg'],
  },
  {
    name: 'تابلو آبستره رنگی',
    slug: 'color-abstract-canvas',
    description: richDesc([
      'تابلو آبستره با پالت گرم؛ نقطه تمرکز بصری برای دیوار پشت مبل.',
    ]),
    price: 1350000,
    sale_price: 1190000,
    sku: 'GD-CAN-013',
    stock_quantity: 9,
    stock_status: 'in_stock',
    categorySlug: 'canvas',
    weight: 2.0,
    specifications: [
      { label: 'ابعاد', value: '۵۰×۵۰ سانتی‌متر' },
      { label: 'سبک', value: 'آبستره' },
      { label: 'قاب', value: 'چوب روشن' },
    ],
    imageUrls: [px(1572386), px(102127)],
    imageAssets: ['products/minimal-canvas-v2.svg', 'products/calligraphy-v2.svg'],
  },
  {
    name: 'فنجان سرامیکی دسته‌دار',
    slug: 'ceramic-mug',
    description: richDesc([
      'فنجان سرامیکی ۳۵۰ میلی‌لیتری با دسته ارگونومیک؛ مناسب قهوه و چای روزانه.',
    ]),
    price: 185000,
    sale_price: null,
    sku: 'GD-KIT-014',
    stock_quantity: 60,
    stock_status: 'in_stock',
    categorySlug: 'kitchen',
    weight: 0.35,
    specifications: [
      { label: 'حجم', value: '۳۵۰ میلی‌لیتر' },
      { label: 'جنس', value: 'سرامیک' },
      { label: 'ماشین ظرفشویی', value: 'بله' },
    ],
    imageUrls: [px(2788792), px(374885)],
    imageAssets: ['products/tea-set-v3.svg', 'products/tea-set-v1.svg'],
  },
  {
    name: 'مجسمه پرنده سفالی',
    slug: 'clay-bird-sculpture',
    description: richDesc([
      'مجسمه پرنده سفالی مینیمال؛ جزئی تزئینی لطیف برای میز کنار تخت یا شلف.',
    ]),
    price: 410000,
    sale_price: 370000,
    sku: 'GD-ART-015',
    stock_quantity: 14,
    stock_status: 'in_stock',
    categorySlug: 'art',
    weight: 0.5,
    specifications: [
      { label: 'جنس', value: 'سفال' },
      { label: 'ارتفاع', value: '۱۲ سانتی‌متر' },
      { label: 'دست‌ساز', value: 'بله' },
    ],
    imageUrls: [px(1350789), px(2693529)],
    imageAssets: ['products/clay-sculpture-v2.svg', 'products/clay-sculpture-v1.svg'],
  },
];

const customers = [
  {
    phone: '09121111111',
    first_name: 'سارا',
    last_name: 'محمدی',
    display_name: 'سارا محمدی',
    city: 'تهران',
    address: 'خیابان ولیعصر، پلاک ۱۲۰',
    postcode: '1593612345',
  },
  {
    phone: '09122222222',
    first_name: 'علی',
    last_name: 'رضایی',
    display_name: 'علی رضایی',
    city: 'اصفهان',
    address: 'خیابان چهارباغ، کوچه گلستان ۱۲',
    postcode: '8145611122',
  },
  {
    phone: '09123333333',
    first_name: 'مریم',
    last_name: 'کریمی',
    display_name: 'مریم کریمی',
    city: 'شیراز',
    address: 'بلوار زند، ساختمان آفتاب واحد ۵',
    postcode: '7134612233',
  },
  {
    phone: '09124444444',
    first_name: 'حسین',
    last_name: 'نوری',
    display_name: 'حسین نوری',
    city: 'مشهد',
    address: 'خیابان امام رضا، پلاک ۸۸',
    postcode: '9177914455',
  },
  {
    phone: '09125555555',
    first_name: 'نگار',
    last_name: 'حسینی',
    display_name: 'نگار حسینی',
    city: 'کرج',
    address: 'گوهردشت، خیابان اصلی ۴۵',
    postcode: '3148617788',
  },
];

const reviewSeeds = [
  { phone: '09121111111', productSlug: 'ceramic-vase-gandom', rating: 5, review: 'گلدان خیلی زیبا و باکیفیت بود. بسته‌بندی عالی.' },
  { phone: '09122222222', productSlug: 'ceramic-vase-gandom', rating: 4, review: 'رنگ کمی روشن‌تر از عکس بود ولی راضی‌ام.' },
  { phone: '09123333333', productSlug: 'minimal-canvas', rating: 5, review: 'تابلو مینیمال عالی برای اتاق کارم.' },
  { phone: '09124444444', productSlug: 'gandom-book-15', rating: 4, review: 'لپ‌تاپ Intel i5 برای کار روزمره کاملاً مناسب است.' },
  { phone: '09121111111', productSlug: 'tea-set', rating: 5, review: 'سرویس چای‌خوری شیک و کاربردی.' },
  { phone: '09122222222', productSlug: 'gandom-book-pro', rating: 5, review: 'Ryzen 7 برای تدوین ویدیو عالی کار می‌کند.' },
  { phone: '09123333333', productSlug: 'scented-candle-set', rating: 4, review: 'رایحه ملایم و ماندگار.' },
  { phone: '09124444444', productSlug: 'gallery-cushion', rating: 5, review: 'کوسن نرم و طرح قشنگ.' },
  { phone: '09125555555', productSlug: 'calm-gift-box', rating: 5, review: 'باکس هدیه خیلی مرتب و شیک بود.' },
  { phone: '09125555555', productSlug: 'color-abstract-canvas', rating: 4, review: 'رنگ‌ها زنده و جذاب‌اند.' },
];

const pages = [
  {
    title: 'درباره ما',
    slug: 'about',
    body: 'گندم گالری، فروشگاه آنلاین محصولات دکوری، هنری و دیجیتال با تمرکز بر کیفیت، بسته‌بندی حرفه‌ای و ارسال سریع در سراسر ایران است.',
  },
  { title: 'تماس با ما', slug: 'contact', body: 'پشتیبانی: ۰۲۱۹۱۰۰۰۰۰۰ — ایمیل: support@gandom.gallery — ساعات پاسخگویی: همه‌روزه ۹ تا ۲۱' },
  { title: 'ارسال و تحویل', slug: 'shipping', body: 'ارسال به سراسر ایران طی ۲ تا ۵ روز کاری. هزینه ارسال ثابت طبق تنظیمات فروشگاه محاسبه می‌شود.' },
  { title: 'بازگشت کالا', slug: 'returns', body: 'امکان بازگشت تا ۷ روز پس از دریافت در صورت سالم بودن کالا و حفظ بسته‌بندی.' },
  { title: 'حریم خصوصی', slug: 'privacy', body: 'اطلاعات کاربری و سفارش‌های شما محرمانه نزد گندم گالری محفوظ است و فقط برای پردازش سفارش استفاده می‌شود.' },
  { title: 'قوانین و مقررات', slug: 'terms', body: 'با ثبت سفارش در گندم گالری، شرایط فروش، ارسال و بازگشت کالا را می‌پذیرید.' },
  {
    title: 'سوالات متداول',
    slug: 'faq',
    body: 'چگونه سفارش ثبت کنم؟ با شماره موبایل وارد شوید، کالا را به سبد اضافه کنید و پرداخت را تکمیل نمایید. کد یکبارمصرف در حالت توسعه: ۱۱۱۱۱',
  },
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

  let imageId: number | undefined;
  if (c.imageUrl || c.imageAsset) {
    const file = await uploadSeedImage(strapi, {
      url: c.imageUrl,
      asset: c.imageAsset,
      name: `nav-cat-${c.slug}.jpg`,
      alternativeText: c.name,
    });
    imageId = file?.id;
  }

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
  if (imageId) data.image = imageId;

  if (!existing) {
    existing = await strapi.db.query('api::nav-category.nav-category').create({ data });
  } else {
    existing = await strapi.db.query('api::nav-category.nav-category').update({
      where: { id: existing.id },
      data: {
        name: data.name,
        description: data.description,
        menu_order: data.menu_order,
        show_in_menu: true,
        commerceSlug: c.slug,
        parent: parentId || null,
        ...(imageId ? { image: imageId } : {}),
      },
    });
  }
  navMap[c.slug] = existing;
  for (const child of c.children || []) {
    await upsertNavCategory(strapi, child, existing.id, navMap);
  }
}

async function upsertWcCategory(
  strapi: Core.Strapi,
  c: CatSeed,
  parentId: number | null,
  catMap: Record<string, any>
) {
  let existing = await strapi.db.query('plugin::webbycommerce.product-category').findOne({
    where: { slug: c.slug },
  });

  let imageId: number | undefined;
  if (c.imageUrl || c.imageAsset) {
    const file = await uploadSeedImage(strapi, {
      url: c.imageUrl,
      asset: c.imageAsset,
      name: `wc-cat-${c.slug}.jpg`,
      alternativeText: c.name,
    });
    imageId = file?.id;
  }

  const data: any = {
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    menu_order: c.menu_order ?? 0,
    show_in_menu: true,
    publishedAt: new Date(),
  };
  if (parentId) data.parent = parentId;
  if (imageId) data.image = imageId;

  if (!existing) {
    existing = await strapi.db.query('plugin::webbycommerce.product-category').create({ data });
  } else {
    existing = await strapi.db.query('plugin::webbycommerce.product-category').update({
      where: { id: existing.id },
      data: {
        name: data.name,
        description: data.description,
        menu_order: data.menu_order,
        show_in_menu: true,
        parent: parentId || null,
        ...(imageId ? { image: imageId } : {}),
      },
    });
  }
  catMap[c.slug] = existing;
  for (const child of c.children || []) {
    await upsertWcCategory(strapi, child, existing.id, catMap);
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

async function seedOrders(strapi: Core.Strapi, userByPhone: Record<string, any>, productBySlug: Record<string, any>) {
  const samples: Array<{
    order_number: string;
    phone: string;
    status: string;
    payment_status: string;
    productSlugs: string[];
    notes: string;
  }> = [
    {
      order_number: 'GD-10001',
      phone: '09121111111',
      status: 'delivered',
      payment_status: 'paid',
      productSlugs: ['ceramic-vase-gandom', 'gallery-cushion'],
      notes: 'تحویل در ساعات اداری',
    },
    {
      order_number: 'GD-10002',
      phone: '09122222222',
      status: 'processing',
      payment_status: 'paid',
      productSlugs: ['gandom-book-15'],
      notes: 'لطفاً قبل از ارسال تماس بگیرید',
    },
    {
      order_number: 'GD-10003',
      phone: '09123333333',
      status: 'shipped',
      payment_status: 'paid',
      productSlugs: ['tea-set', 'scented-candle-set'],
      notes: '',
    },
    {
      order_number: 'GD-10004',
      phone: '09124444444',
      status: 'pending',
      payment_status: 'pending',
      productSlugs: ['minimal-canvas'],
      notes: 'در انتظار پرداخت',
    },
    {
      order_number: 'GD-10005',
      phone: '09125555555',
      status: 'delivered',
      payment_status: 'paid',
      productSlugs: ['calm-gift-box', 'brass-pendant'],
      notes: 'هدیه — بدون فاکتور قیمت روی جعبه',
    },
  ];

  for (const sample of samples) {
    try {
      const existing = await strapi.db.query('plugin::webbycommerce.order').findOne({
        where: { order_number: sample.order_number },
      });
      if (existing) continue;

      const user = userByPhone[sample.phone];
      const cust = customers.find((c) => c.phone === sample.phone);
      if (!user || !cust) continue;

      const items = sample.productSlugs.map((s) => productBySlug[s]).filter(Boolean);
      if (!items.length) continue;

      const subtotal = items.reduce((sum, p) => sum + Number(p.sale_price ?? p.price ?? 0), 0);
      const shipping = 45000;
      const total = subtotal + shipping;

      const address = await strapi.db.query('plugin::webbycommerce.address').create({
        data: {
          type: 1,
          first_name: cust.first_name,
          last_name: cust.last_name,
          country: 'IR',
          region: cust.city === 'تهران' ? 'تهران' : cust.city,
          city: cust.city,
          street_address: cust.address,
          postcode: cust.postcode,
          phone: cust.phone,
          email_address: user.email,
          user: user.id,
        },
      });

      await strapi.db.query('plugin::webbycommerce.order').create({
        data: {
          order_number: sample.order_number,
          status: sample.status,
          user: user.id,
          items: items.map((p) => p.id),
          subtotal,
          tax_amount: 0,
          shipping_amount: shipping,
          discount_amount: 0,
          total,
          currency: 'IRR',
          billing_address: address.id,
          shipping_address: address.id,
          payment_method: 'COD',
          payment_status: sample.payment_status,
          shipping_method: 'پست پیشتاز',
          notes: sample.notes,
          tracking_number: sample.status === 'shipped' || sample.status === 'delivered' ? `TRK-${sample.order_number}` : null,
        },
      });
    } catch (e) {
      strapi.log.warn('[gandom] order seed', sample.order_number, e);
    }
  }
}

async function seedFavoritesAndComments(
  strapi: Core.Strapi,
  userByPhone: Record<string, any>
) {
  const favs = [
    { phone: '09121111111', slug: 'gandom-book-pro' },
    { phone: '09121111111', slug: 'tea-set' },
    { phone: '09122222222', slug: 'ceramic-vase-gandom' },
    { phone: '09125555555', slug: 'color-abstract-canvas' },
  ];
  for (const f of favs) {
    try {
      const user = userByPhone[f.phone];
      if (!user) continue;
      const existing = await strapi.db.query('api::favorite.favorite').findOne({
        where: { productSlug: f.slug, user: user.id },
      });
      if (existing) continue;
      await strapi.db.query('api::favorite.favorite').create({
        data: { productSlug: f.slug, user: user.id },
      });
    } catch (e) {
      strapi.log.warn('[gandom] favorite seed', f.slug, e);
    }
  }

  const comments = [
    {
      phone: '09123333333',
      slug: 'gallery-cushion',
      rating: 5,
      body: 'کیفیت مخمل عالی است و رنگ‌ها زنده مانده‌اند.',
    },
    {
      phone: '09124444444',
      slug: 'calligraphy-canvas',
      rating: 4,
      body: 'قاب چوبی بسیار باکیفیت؛ پیشنهاد می‌کنم.',
    },
    {
      phone: '09125555555',
      slug: 'ceramic-mug',
      rating: 5,
      body: 'فنجان سبک و زیباست؛ هر روز استفاده می‌کنم.',
    },
  ];
  for (const c of comments) {
    try {
      const user = userByPhone[c.phone];
      if (!user) continue;
      const existing = await strapi.db.query('api::store-comment.store-comment').findOne({
        where: { productSlug: c.slug, user: user.id },
      });
      if (existing) continue;
      await strapi.db.query('api::store-comment.store-comment').create({
        data: {
          productSlug: c.slug,
          body: c.body,
          rating: c.rating,
          is_visible: true,
          user: user.id,
        },
      });
    } catch (e) {
      strapi.log.warn('[gandom] store-comment seed', c.slug, e);
    }
  }
}

export async function seedPersianCatalog(strapi: Core.Strapi) {
  const catMap: Record<string, any> = {};
  const productBySlug: Record<string, any> = {};

  try {
    for (const root of categoryTree) {
      await upsertWcCategory(strapi, root, null, catMap);
    }
  } catch (e) {
    strapi.log.warn('[gandom] wc category seed', e);
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
    const imageIds: number[] = [];
    const gallery_urls: string[] = [];
    for (let i = 0; i < p.imageUrls.length; i++) {
      const url = p.imageUrls[i];
      const asset = p.imageAssets?.[i];
      const uploaded = await uploadSeedImage(strapi, {
        url,
        asset,
        name: `${p.slug}-${i + 1}.jpg`,
        alternativeText: `${p.name} — تصویر ${i + 1}`,
      });
      if (uploaded?.id) {
        imageIds.push(uploaded.id);
        if (uploaded.url) gallery_urls.push(uploaded.url);
      }
    }

    let existing = await strapi.db.query('plugin::webbycommerce.product').findOne({
      where: { slug: p.slug },
    });

    const data: any = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      sale_price: p.sale_price,
      sku: p.sku,
      stock_quantity: p.stock_quantity,
      stock_status: p.stock_status,
      weight: p.weight ?? null,
      product_categories: catMap[p.categorySlug] ? [catMap[p.categorySlug].id] : [],
      specifications: p.specifications,
      gallery_urls,
      publishedAt: new Date(),
    };
    if (imageIds.length) data.images = imageIds;

    if (!existing) {
      existing = await strapi.db.query('plugin::webbycommerce.product').create({ data });
    } else {
      try {
        existing = await strapi.db.query('plugin::webbycommerce.product').update({
          where: { id: existing.id },
          data: {
            name: data.name,
            description: data.description,
            price: data.price,
            sale_price: data.sale_price,
            stock_quantity: data.stock_quantity,
            stock_status: data.stock_status,
            weight: data.weight,
            product_categories: data.product_categories,
            specifications: data.specifications,
            gallery_urls: data.gallery_urls,
            ...(imageIds.length ? { images: imageIds } : {}),
          },
        });
      } catch (e) {
        strapi.log.warn('[gandom] product update', p.slug, e);
      }
    }

    productBySlug[p.slug] = existing;
    try {
      await upsertProductMeta(strapi, p.slug, p.specifications, gallery_urls);
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
      const product = productBySlug[r.productSlug];
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

  await seedOrders(strapi, userByPhone, productBySlug);
  await seedFavoritesAndComments(strapi, userByPhone);

  for (const page of pages) {
    try {
      const existing = await strapi.documents('api::page.page').findMany({
        filters: { slug: page.slug },
      });
      if (existing?.length) {
        await strapi.documents('api::page.page').update({
          documentId: existing[0].documentId,
          status: 'published',
          data: { title: page.title, body: page.body, publishedAt: new Date() } as any,
        });
        continue;
      }
      await strapi.documents('api::page.page').create({
        status: 'published',
        data: { ...page, publishedAt: new Date() } as any,
      });
    } catch (e) {
      strapi.log.warn('[gandom] page seed', page.slug, e);
    }
  }

  // Enrich store settings presentation defaults
  try {
    const store = await strapi.documents('api::store-setting.store-setting').findFirst({});
    const logo = await uploadSeedImage(strapi, {
      url: px(1350789),
      asset: 'categories/gifts.svg',
      name: 'gandom-logo.jpg',
      alternativeText: 'لوگوی گندم گالری',
    });
    const payload: any = {
      storeName: 'گندم گالری',
      currencyLabel: 'تومان',
      shippingFlatToman: 45000,
      taxEnabled: false,
      lowStockThreshold: 5,
      phone: '02191000000',
      email: 'support@gandom.gallery',
      address: 'تهران، خیابان ولیعصر',
      seoDefaults: {
        title: 'گندم گالری | فروشگاه آنلاین دکوری و هنری',
        description: 'خرید آنلاین محصولات دکوری، هنری، هدیه و دیجیتال با ارسال سریع',
      },
    };
    if (logo?.id) payload.logo = logo.id;
    if (!store) {
      await strapi.documents('api::store-setting.store-setting').create({
        status: 'published',
        data: payload,
      });
    } else {
      await strapi.documents('api::store-setting.store-setting').update({
        documentId: store.documentId,
        status: 'published',
        data: payload,
      });
    }
  } catch (e) {
    strapi.log.warn('[gandom] store-setting enrich', e);
  }

  strapi.log.info(
    `[gandom] Persian demo seed complete — ${products.length} products, categories, orders, reviews, homepage-ready media`
  );
}

export async function seedHomepageSections(
  strapi: Core.Strapi,
  opts: { force?: boolean } = {}
) {
  try {
    const hero1 = await uploadSeedImage(strapi, {
      url: px(1571460),
      asset: 'home/hero-welcome.svg',
      name: 'home-hero-welcome.jpg',
      alternativeText: 'به گندم گالری خوش آمدید',
    });
    const hero2 = await uploadSeedImage(strapi, {
      url: px(931177),
      asset: 'home/hero-sale.svg',
      name: 'home-hero-sale.jpg',
      alternativeText: 'پیشنهاد ویژه',
    });
    const hero3 = await uploadSeedImage(strapi, {
      url: px(18105, 'pexels-photo.jpg'),
      asset: 'home/hero-laptop.svg',
      name: 'home-hero-laptop.jpg',
      alternativeText: 'لپ‌تاپ‌های گندم',
    });
    const bannerDecor = await uploadSeedImage(strapi, {
      url: px(3738085),
      asset: 'home/banner-decor.svg',
      name: 'home-banner-decor.jpg',
      alternativeText: 'دکوری خانه',
    });
    const bannerLaptop = await uploadSeedImage(strapi, {
      url: px(1229861),
      asset: 'home/banner-laptop.svg',
      name: 'home-banner-laptop.jpg',
      alternativeText: 'لپ‌تاپ‌ها',
    });
    const bannerGift = await uploadSeedImage(strapi, {
      url: px(1191710),
      asset: 'home/banner-gift.svg',
      name: 'home-banner-gift.jpg',
      alternativeText: 'هدیه خاص',
    });

    const storySale = await uploadSeedImage(strapi, {
      url: px(4207892),
      asset: 'home/story-sale.svg',
      name: 'home-story-sale.jpg',
      alternativeText: 'شگفت‌انگیز',
    });
    const storyDecor = await uploadSeedImage(strapi, {
      url: px(1090638),
      asset: 'home/story-decor.svg',
      name: 'home-story-decor.jpg',
      alternativeText: 'دکوری',
    });
    const storyLaptop = await uploadSeedImage(strapi, {
      url: px(205421),
      asset: 'home/story-laptop.svg',
      name: 'home-story-laptop.jpg',
      alternativeText: 'لپ‌تاپ',
    });
    const storyGift = await uploadSeedImage(strapi, {
      url: px(931177),
      asset: 'home/story-gift.svg',
      name: 'home-story-gift.jpg',
      alternativeText: 'هدیه',
    });
    const storyAll = await uploadSeedImage(strapi, {
      url: px(1080696),
      asset: 'home/story-all.svg',
      name: 'home-story-all.jpg',
      alternativeText: 'همه کالاها',
    });

    const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const sectionsPayload: any[] = [
      {
        __component: 'sections.hero-slider',
        slides: [
          {
            title: 'به گندم گالری خوش آمدید',
            subtitle: 'فروشگاه کامل آنلاین با ارسال سریع در سراسر ایران',
            link: '/shop',
            ...(hero1?.id ? { image: hero1.id } : { imageUrl: '' }),
          },
          {
            title: 'پیشنهادهای شگفت‌انگیز هفته',
            subtitle: 'تخفیف‌های منتخب روی دکوری و هدیه',
            link: '/shop?sort=sale',
            ...(hero2?.id ? { image: hero2.id } : { imageUrl: '' }),
          },
          {
            title: 'لپ‌تاپ‌های گندم بوک',
            subtitle: 'از دانشجویی تا حرفه‌ای — گارانتی اصالت',
            link: '/category/laptop',
            ...(hero3?.id ? { image: hero3.id } : { imageUrl: '' }),
          },
        ],
      },
      {
        __component: 'sections.story-row',
        items: [
          {
            title: 'شگفت‌انگیز',
            link: '/shop?sort=sale',
            color: '#ef4056',
            ...(storySale?.id ? { image: storySale.id } : {}),
          },
          {
            title: 'دکوری',
            link: '/category/decor',
            color: '#19bfd3',
            ...(storyDecor?.id ? { image: storyDecor.id } : {}),
          },
          {
            title: 'لپ‌تاپ',
            link: '/category/laptop',
            color: '#6366f1',
            ...(storyLaptop?.id ? { image: storyLaptop.id } : {}),
          },
          {
            title: 'هدیه',
            link: '/category/gift',
            color: '#f9a825',
            ...(storyGift?.id ? { image: storyGift.id } : {}),
          },
          {
            title: 'همه کالاها',
            link: '/shop',
            color: '#3f4064',
            ...(storyAll?.id ? { image: storyAll.id } : {}),
          },
        ],
      },
      {
        __component: 'sections.incredible-offers',
        title: 'پیشنهاد شگفت‌انگیز',
        themeColor: '#ef4056',
        endsAt,
        source: 'sale',
        limit: 10,
        link: '/shop?sort=sale',
      },
      {
        __component: 'sections.category-grid',
        title: 'دسته‌بندی‌ها',
        categorySlugs: 'home-kitchen,art-gallery,gifts,digital,decor,laptop',
      },
      {
        __component: 'sections.banner-grid',
        columns: '2',
        banners: [
          {
            title: 'دکوری خانه',
            link: '/category/decor',
            ...(bannerDecor?.id ? { image: bannerDecor.id } : { imageUrl: '' }),
          },
          {
            title: 'لپ‌تاپ‌ها',
            link: '/category/laptop',
            ...(bannerLaptop?.id ? { image: bannerLaptop.id } : { imageUrl: '' }),
          },
          {
            title: 'هدیه خاص',
            link: '/category/gift',
            ...(bannerGift?.id ? { image: bannerGift.id } : { imageUrl: '' }),
          },
        ],
      },
      {
        __component: 'sections.product-slider',
        title: 'پرفروش‌های دکوری',
        source: 'category',
        categorySlug: 'decor',
        limit: 8,
        link: '/category/decor',
      },
      {
        __component: 'sections.product-row',
        title: 'جدیدترین‌ها',
        source: 'newest',
        limit: 10,
        link: '/shop?sort=newest',
      },
      {
        __component: 'sections.product-slider',
        title: 'لپ‌تاپ و دیجیتال',
        source: 'category',
        categorySlug: 'laptop',
        limit: 6,
        link: '/category/laptop',
      },
      {
        __component: 'sections.trust-badges',
        items: [
          { title: 'ارسال سریع', text: 'به سراسر ایران' },
          { title: 'ضمانت اصالت', text: 'کالای اصل' },
          { title: '۷ روز بازگشت', text: 'بدون دردسر' },
          { title: 'پشتیبانی', text: 'همه‌روزه ۹ تا ۲۱' },
        ],
      },
    ];

    const home = await strapi.documents('api::homepage.homepage').findFirst({});
    const payload = {
      seoTitle: 'گندم گالری | فروشگاه آنلاین دکوری و هنری',
      seoDescription: 'خرید آسان محصولات دکوری، هنری، هدیه و دیجیتال با ارسال سریع',
      sections: sectionsPayload,
    };

    if (!home) {
      await strapi.documents('api::homepage.homepage').create({
        status: 'published',
        data: payload as any,
      });
      strapi.log.info('[gandom] Homepage created with full demo sections');
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
    const force = opts.force === true || process.env.GANDOM_SEED_FORCE === 'true';

    if (force || isEmpty || isLegacyJson) {
      await strapi.documents('api::homepage.homepage').update({
        documentId: home.documentId,
        status: 'published',
        data: payload as any,
      });
      strapi.log.info('[gandom] Homepage dynamic-zone sections seeded (presentation ready)');
    } else if (home.documentId) {
      await strapi.documents('api::homepage.homepage').publish({
        documentId: home.documentId,
      });
    }
  } catch (e) {
    strapi.log.warn('[gandom] seedHomepageSections', e);
  }
}
