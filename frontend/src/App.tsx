import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { CartLine } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { getToken } from './lib/api';
import { mediaUrl } from './lib/format';
import { StoreSettingsProvider } from './lib/store-settings';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() =>
  import('./pages/ProductPage').then((m) => ({ default: m.ProductPage }))
);
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const PaymentCallbackPage = lazy(() =>
  import('./pages/PaymentCallbackPage').then((m) => ({ default: m.PaymentCallbackPage }))
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.AccountPage }))
);
const CmsPage = lazy(() => import('./pages/CmsPage').then((m) => ({ default: m.CmsPage })));

const CART_KEY = 'gandom_cart_v1';
const USER_KEY = 'gandom_user';

function RouteFallback() {
  return (
    <div className="dk-container py-16 text-center text-[var(--dk-muted)] text-sm">
      در حال بارگذاری...
    </div>
  );
}

function loadCart(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function AppShell() {
  const [cart, setCart] = useState<CartLine[]>(loadCart);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(t);
  }, [toastVisible]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  function addProduct(p: Record<string, unknown>) {
    const id = (p.documentId || p.id || p.slug) as string | number;
    const price = Number(p.sale_price ?? p.price) || 0;
    const rawImg = Array.isArray(p.images) ? p.images[0] : p.images;
    const image = rawImg ? mediaUrl(rawImg, 'small') || undefined : undefined;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id, name: String(p.name), price, quantity: 1, image }];
    });
    setToastVisible(true);
  }

  function inc(id: string | number) {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  }
  function dec(id: string | number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }
  function remove(id: string | number) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col font-vazir bg-[#fafafa]">
      <Header
        cartCount={cartCount}
        cartItems={cart}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
        onOpenAuth={() => {
          if (getToken() && user) navigate('/account');
          else setAuthOpen(true);
        }}
        userLabel={
          (user?.display_name as string | undefined) || (user?.phone_no as string | undefined)
        }
      />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage onAdd={addProduct} />} />
            <Route path="/shop" element={<ShopPage onAdd={addProduct} />} />
            <Route path="/category/:slug" element={<ShopPage onAdd={addProduct} />} />
            <Route path="/search" element={<ShopPage onAdd={addProduct} />} />
            <Route
              path="/product/:slug"
              element={
                <ProductPage onAdd={addProduct} onNeedAuth={() => setAuthOpen(true)} />
              }
            />
            <Route
              path="/cart"
              element={<CartPage items={cart} onInc={inc} onDec={dec} onRemove={remove} />}
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  items={cart}
                  user={user}
                  onNeedAuth={() => setAuthOpen(true)}
                  onClearCart={() => setCart([])}
                />
              }
            />
            <Route path="/payment/callback" element={<PaymentCallbackPage />} />
            <Route
              path="/account"
              element={
                <AccountPage
                  user={user}
                  onNeedAuth={() => setAuthOpen(true)}
                  onLogout={() => setUser(null)}
                  onUserUpdate={(u) => setUser(u)}
                />
              }
            />
            <Route path="/page/:slug" element={<CmsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        }}
      />
      <Toast message="کالا اضافه شد!" visible={toastVisible} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreSettingsProvider>
        <AppShell />
      </StoreSettingsProvider>
    </BrowserRouter>
  );
}
