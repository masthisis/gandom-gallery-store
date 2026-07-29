import { useState } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mockData';
import type { Product, CartItem } from './types';
import { Zap, Sparkles, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export function App() {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    setOrderSuccess(true);
    setCart([]);
    setIsCartOpen(false);
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category?.slug === selectedCategory : true;
    const matchesSearch = searchQuery
      ? p.titleFa.includes(searchQuery) || p.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const incredibleOffers = products.filter((p) => p.isIncredible);

  return (
    <div className="min-h-screen bg-gray-100 font-vazir text-right pb-16">
      {/* Header */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
      />

      {/* Order Success Toast Notification */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <Sparkles className="w-6 h-6 animate-spin" />
          <div>
            <p className="font-bold text-sm">سفارش شما با موفقیت ثبت شد!</p>
            <p className="text-xs text-emerald-100">کد پیگیری به شماره موبایل شما پیامک شد.</p>
          </div>
        </div>
      )}

      {/* Hero Banner Slider */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-8 md:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
              جشنواره سالانه گندم گالری
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
              جدیدترین کالاهای دیجیتال با تضمین بهترین قیمت و اصالت
            </h1>
            <p className="text-sm text-red-100 leading-relaxed">
              انواع گوشی موبایل، لپ‌تاپ گیمینگ، ساعت هوشمند و هدفون‌های لغو نویز با گارانتی ۱۸ ماهه شرکتی.
            </p>
            <div className="pt-2">
              <a
                href="#products"
                className="inline-block bg-white text-red-600 font-extrabold text-sm px-6 py-3 rounded-xl shadow border border-transparent hover:bg-gray-100 transition"
              >
                مشاهده همه محصولات
              </a>
            </div>
          </div>

          <div className="w-full md:w-80 h-48 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 flex flex-col justify-center items-center text-center">
            <Zap className="w-12 h-12 text-yellow-300 mb-2 animate-bounce" />
            <h3 className="font-extrabold text-lg">پیشنهاد شگفت‌انگیز روز</h3>
            <p className="text-xs text-red-100 mt-1">تخفیف ویژه تا ٪۴۰ روی کالاهای انتخابی</p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 my-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Truck className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-xs font-bold text-gray-800">ارسال اکسپرس و رایگان</span>
            <span className="text-[11px] text-gray-400 mt-0.5">در سریع‌ترین زمان ممکن</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-xs font-bold text-gray-800">ضمانت اصالت کالا</span>
            <span className="text-[11px] text-gray-400 mt-0.5">۱۰۰٪ کالای اصل</span>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-xs font-bold text-gray-800">۷ روز ضمانت بازگشت</span>
            <span className="text-[11px] text-gray-400 mt-0.5">بازگشت بدون قید و شرط</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-xs font-bold text-gray-800">پشتیبانی ۲۴/۷</span>
            <span className="text-[11px] text-gray-400 mt-0.5">پاسخگویی در تمام روزها</span>
          </div>
        </div>
      </div>

      {/* Incredible Offers Horizontal Section */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="bg-red-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 fill-yellow-300 text-yellow-300" />
              <h2 className="text-lg font-black">پیشنهادهای شگفت‌انگیز</h2>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">زمان باقی‌مانده: ۰۴:۱۲:۵۹</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {incredibleOffers.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="products" className="max-w-7xl mx-auto px-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            همه کالاها
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat.nameFa}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
