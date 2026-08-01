import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Bell, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toFarsiDigits } from '../lib/format';
import { MegaMenu, MegaMenuTrigger } from './dk/MegaMenu';
import { SearchDropdown } from './SearchDropdown';
import { MiniCartDropdown } from './MiniCartDropdown';
import type { CartLine } from './CartDrawer';

type Props = {
  cartCount: number;
  cartItems: CartLine[];
  onInc: (id: string | number) => void;
  onDec: (id: string | number) => void;
  onRemove: (id: string | number) => void;
  onOpenAuth: () => void;
  userLabel?: string | null;
};

export function Header({
  cartCount,
  cartItems,
  onInc,
  onDec,
  onRemove,
  onOpenAuth,
  userLabel,
}: Props) {
  const [q, setQ] = useState('');
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const cartTimer = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const closeMega = useCallback(() => setMegaOpen(false), []);

  useEffect(() => {
    function syncHeaderH() {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          '--header-h',
          `${headerRef.current.offsetHeight}px`
        );
      }
    }
    syncHeaderH();
    window.addEventListener('resize', syncHeaderH);
    return () => window.removeEventListener('resize', syncHeaderH);
  }, [mobileMenu]);

  function openCartHover() {
    if (cartTimer.current) window.clearTimeout(cartTimer.current);
    setCartHover(true);
    setMegaOpen(false);
  }

  function closeCartHover() {
    if (cartTimer.current) window.clearTimeout(cartTimer.current);
    cartTimer.current = window.setTimeout(() => setCartHover(false), 180);
  }

  function goSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white shadow-sm relative">
      <div className="dk-container py-3 flex items-center gap-2 md:gap-3">
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-[var(--dk-surface)]"
          onClick={() => setMobileMenu((v) => !v)}
          aria-label="منو"
        >
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="text-xl font-extrabold text-[var(--dk-cta)] whitespace-nowrap tracking-tight">
          گندم گالری
        </Link>

        <MegaMenuTrigger
          active={megaOpen}
          onClick={() => {
            setMegaOpen((v) => !v);
            setSearchOpen(false);
            setCartHover(false);
          }}
        />

        <button
          type="button"
          onClick={() => {
            setSearchOpen(true);
            setMegaOpen(false);
          }}
          className="flex-1 max-w-2xl"
        >
          <div className="flex w-full items-center rounded-lg bg-[var(--dk-surface)] px-3 py-2.5 text-start pointer-events-none">
            <Search className="w-4 h-4 text-[var(--dk-muted)] me-2 shrink-0" />
            <span className="text-sm text-[var(--dk-muted)] truncate">
              {q || 'جستجو در گندم گالری'}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-0.5 ms-auto">
          <button
            type="button"
            className="hidden sm:flex p-2.5 rounded-lg hover:bg-[var(--dk-surface)] text-[var(--dk-muted)]"
            aria-label="اعلان‌ها"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 text-xs font-medium px-2.5 py-2 rounded-lg hover:bg-[var(--dk-surface)] text-[#3f4064]"
          >
            <User className="w-5 h-5" />
            <span className="hidden lg:inline max-w-[100px] truncate">
              {userLabel || 'ورود | ثبت‌نام'}
            </span>
          </button>

          <div
            className="relative"
            onMouseEnter={openCartHover}
            onMouseLeave={closeCartHover}
          >
            <Link
              to="/cart"
              className="relative flex p-2.5 rounded-lg hover:bg-[var(--dk-surface)]"
              aria-label="سبد خرید"
              onClick={() => setCartHover(false)}
            >
              <ShoppingCart className="w-5 h-5 text-[#3f4064]" />
              {cartCount > 0 && (
                <span className="absolute top-0 start-0 bg-[var(--dk-cta)] text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                  {toFarsiDigits(cartCount)}
                </span>
              )}
            </Link>
            <div className="hidden md:block">
              <MiniCartDropdown
                open={cartHover}
                items={cartItems}
                onInc={onInc}
                onDec={onDec}
                onRemove={onRemove}
                onMouseEnter={openCartHover}
                onMouseLeave={closeCartHover}
              />
            </div>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <div className="md:hidden border-t border-gray-100 dk-container py-3 space-y-2">
          <button
            type="button"
            className="w-full text-start px-3 py-2 rounded-lg bg-[var(--dk-surface)] text-sm font-medium"
            onClick={() => {
              setMegaOpen(true);
              setMobileMenu(false);
            }}
          >
            دسته‌بندی کالاها
          </button>
          <Link to="/shop" className="block px-3 py-2 text-sm" onClick={() => setMobileMenu(false)}>
            فروشگاه
          </Link>
          <Link to="/account" className="block px-3 py-2 text-sm" onClick={() => setMobileMenu(false)}>
            حساب کاربری
          </Link>
          <Link to="/cart" className="block px-3 py-2 text-sm" onClick={() => setMobileMenu(false)}>
            سبد خرید ({toFarsiDigits(cartCount)})
          </Link>
        </div>
      )}

      <MegaMenu open={megaOpen} onClose={closeMega} />

      <SearchDropdown
        open={searchOpen}
        query={q}
        onQueryChange={setQ}
        onClose={() => setSearchOpen(false)}
        onSubmit={goSearch}
      />
    </header>
  );
}
