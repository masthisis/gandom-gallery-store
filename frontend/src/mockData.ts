import type { Product, Category } from './types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'mobile', nameFa: 'موبایل و تبلت', slug: 'mobile', icon: 'Smartphone' },
  { id: 2, name: 'laptop', nameFa: 'لپ‌تاپ و تجهیزات جانبی', slug: 'laptop', icon: 'Laptop' },
  { id: 3, name: 'fashion', nameFa: 'مد و پوشاک', slug: 'fashion', icon: 'Shirt' },
  { id: 4, name: 'home', nameFa: 'خانه و آشپزخانه', slug: 'home', icon: 'Home' },
  { id: 5, name: 'beauty', nameFa: 'آرایشی و بهداشتی', slug: 'beauty', icon: 'Sparkles' },
  { id: 6, name: 'books', nameFa: 'کتاب و لوازم التحریر', slug: 'books', icon: 'BookOpen' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Apple iPhone 15 Pro Max 256GB',
    titleFa: 'گوشی موبایل اپل مدل iPhone 15 Pro Max دو سیم کارت ظرفیت 256 gigabyte',
    slug: 'iphone-15-pro-max',
    price: 68500000,
    discountPrice: 64900000,
    stock: 8,
    rating: 4.8,
    isIncredible: true,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    descriptionFa: 'گوشی آیفون ۱۵ پرو مکس با بدنه تیتانیومی سبک و تراشه A17 Pro، دوربین با زوم ۵ برابری اپتیکال.',
    sellerName: 'دیجی‌کالا رسمی',
    category: MOCK_CATEGORIES[0]
  },
  {
    id: 2,
    title: 'Samsung Galaxy S24 Ultra 512GB',
    titleFa: 'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra 5G ظرفیت 512 گیگابایت',
    slug: 'galaxy-s24-ultra',
    price: 62000000,
    discountPrice: 58500000,
    stock: 12,
    rating: 4.7,
    isIncredible: true,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    descriptionFa: 'پرچمدار سامسونگ با هوش مصنوعی Galaxy AI و قلم S-Pen متصل همراه با دوربین ۲۰۰ مگاپیکسلی.',
    sellerName: 'گندم گالری',
    category: MOCK_CATEGORIES[0]
  },
  {
    id: 3,
    title: 'Apple MacBook Pro M3 Pro 16 inch',
    titleFa: 'لپ تاپ ۱۶ اینچی اپل مدل MacBook Pro M3 Pro 18GB 512GB SSD',
    slug: 'macbook-pro-m3',
    price: 125000000,
    discountPrice: 119000000,
    stock: 5,
    rating: 4.9,
    isIncredible: false,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    descriptionFa: 'قدرتمندترین لپ‌تاپ حرفه‌ای با پردازنده M3 Pro و صفحه نمایش Liquid Retina XDR.',
    sellerName: 'دیجی‌کالا رسمی',
    category: MOCK_CATEGORIES[1]
  },
  {
    id: 4,
    title: 'Sony WH-1000XM5 Wireless Headphones',
    titleFa: 'هدفون بی‌سیم سونی مدل WH-1000XM5 با قابلیت حذف نویز فعال',
    slug: 'sony-wh1000xm5',
    price: 18500000,
    discountPrice: 16900000,
    stock: 15,
    rating: 4.6,
    isIncredible: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    descriptionFa: 'هدفون پرچمدار سونی با برترین کیفیت حذف نویز اکتیو و شارژدهی تا ۳۰ ساعت.',
    sellerName: 'فروشگاه پارس تکنولوژی',
    category: MOCK_CATEGORIES[1]
  },
  {
    id: 5,
    title: 'Asus ROG Strix G16 Gaming Laptop',
    titleFa: 'لپ تاپ گیمینگ ۱۶ اینچی ایسوس مدل ROG Strix G16 i7 16GB 1TB RTX4060',
    slug: 'rog-strix-g16',
    price: 78000000,
    discountPrice: 74500000,
    stock: 6,
    rating: 4.7,
    isIncredible: false,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
    descriptionFa: 'لپ‌تاپ مخصوص بازی ایسوس با کارت گرافیک RTX 4060 و صفحه نمایش ۱۶۵ هرتزی.',
    sellerName: 'گندم گالری',
    category: MOCK_CATEGORIES[1]
  },
  {
    id: 6,
    title: 'Apple Watch Series 9 GPS 45mm',
    titleFa: 'ساعت هوشمند اپل مدل Series 9 آلومینیوم ۴۵ میلی‌متری',
    slug: 'apple-watch-s9',
    price: 21000000,
    discountPrice: 19500000,
    stock: 20,
    rating: 4.8,
    isIncredible: true,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    descriptionFa: 'ساعت هوشمند جدید اپل با ژست حرکتی Double Tap و چیپست جدید S9.',
    sellerName: 'دیجی‌کالا رسمی',
    category: MOCK_CATEGORIES[0]
  }
];
