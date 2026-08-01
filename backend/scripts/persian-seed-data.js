#!/usr/bin/env node
/**
 * Persian seed for WebbyCommerce + CMS pages
 * Run: cd backend && node ./scripts/seed-persian.js
 * Requires Strapi running OR use via bootstrap env GANDOM_SEED=true
 */

const categories = [
  { name: 'دکوری', slug: 'decor', description: 'آیتم‌های دکوری خانه' },
  { name: 'هنری', slug: 'art', description: 'آثار هنری و گالری' },
  { name: 'هدیه', slug: 'gift', description: 'پیشنهاد هدیه' },
  { name: 'لوازم جانبی', slug: 'accessories', description: 'اکسسوری' },
];

const products = [
  {
    name: 'گلدان سرامیکی گندم',
    slug: 'ceramic-vase-gandom',
    description: 'گلدان دست‌ساز سرامیکی با لعاب مات',
    price: 890000,
    sale_price: 750000,
    sku: 'GD-VAS-001',
    stock_quantity: 25,
    stock_status: 'in_stock',
    categorySlug: 'decor',
  },
  {
    name: 'تابلو نقاشی مینیمال',
    slug: 'minimal-canvas',
    description: 'تابلو چاپی مینیمال برای فضای مدرن',
    price: 1200000,
    sale_price: null,
    sku: 'GD-ART-002',
    stock_quantity: 12,
    stock_status: 'in_stock',
    categorySlug: 'art',
  },
  {
    name: 'ست شمع معطر',
    slug: 'scented-candle-set',
    description: 'ست سه عددی شمع با رایحه ملایم',
    price: 450000,
    sale_price: 390000,
    sku: 'GD-GIF-003',
    stock_quantity: 40,
    stock_status: 'in_stock',
    categorySlug: 'gift',
  },
  {
    name: 'آویز برنجی',
    slug: 'brass-pendant',
    description: 'آویز تزئینی برنجی ساخت ایران',
    price: 320000,
    sale_price: null,
    sku: 'GD-ACC-004',
    stock_quantity: 30,
    stock_status: 'in_stock',
    categorySlug: 'accessories',
  },
  {
    name: 'کوسن گالری',
    slug: 'gallery-cushion',
    description: 'کوسن مخمل با طرح اختصاصی گندم گالری',
    price: 280000,
    sale_price: 240000,
    sku: 'GD-DEC-005',
    stock_quantity: 50,
    stock_status: 'in_stock',
    categorySlug: 'decor',
  },
  {
    name: 'مجسمه سفالی کوچک',
    slug: 'small-clay-sculpture',
    description: 'مجسمه سفالی دست‌ساز',
    price: 650000,
    sale_price: null,
    sku: 'GD-ART-006',
    stock_quantity: 8,
    stock_status: 'in_stock',
    categorySlug: 'art',
  },
];

const pages = [
  { title: 'درباره ما', slug: 'about', body: 'گندم گالری، فروشگاهی برای علاقه‌مندان به زیبایی و هنر.' },
  { title: 'تماس با ما', slug: 'contact', body: 'پشتیبانی: ۰۲۱۹۱۰۰۰۰۰۰' },
  { title: 'ارسال و تحویل', slug: 'shipping', body: 'ارسال به سراسر ایران طی ۲ تا ۵ روز کاری.' },
  { title: 'بازگشت کالا', slug: 'returns', body: 'امکان بازگشت تا ۷ روز پس از دریافت.' },
  { title: 'حریم خصوصی', slug: 'privacy', body: 'اطلاعات شما محرمانه نزد ما محفوظ است.' },
  { title: 'قوانین و مقررات', slug: 'terms', body: 'قوانین استفاده از فروشگاه گندم گالری.' },
  { title: 'سوالات متداول', slug: 'faq', body: 'چگونه سفارش ثبت کنم؟ با شماره موبایل وارد شوید و پرداخت کنید.' },
];

module.exports = { categories, products, pages };
