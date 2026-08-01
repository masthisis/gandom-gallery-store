import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toFarsiDigits } from '../lib/format';
import { useStoreSettings } from '../lib/store-settings';
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
  const { storeName, logoUrl } = useStoreSettings();

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
  }, [mobileMenu, searchOpen]);

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

  function SearchField({ className = '' }: { className?: string }) {
    return (
      <button
        type="button"
        onClick={() => {
          setSearchOpen(true);
          setMegaOpen(false);
          setMobileMenu(false);
        }}
        className={className}
      >
        <div className="flex w-full items-center rounded-xl bg-[var(--dk-surface)] px-3 py-2.5 text-start pointer-events-none">
          <Search className="w-4 h-4 text-[var(--dk-muted)] me-2 shrink-0" />
          <span className="text-sm text-[var(--dk-muted)] truncate">
            {q || `جستجو در ${storeName}`}
          </span>
        </div>
      </button>
    );
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white shadow-sm relative">
      <div className="dk-container">
        {/* Row 1: brand + actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 py-2.5 md:py-3">
          <button
            type="button"
            className="md:hidden p-2.5 -ms-1 rounded-xl hover:bg-[var(--dk-surface)] min-w-11 min-h-11"
            onClick={() => {
              setMobileMenu((v) => !v);
              setMegaOpen(false);
            }}
            aria-label="منو"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 min-w-0"
            onClick={() => setMobileMenu(false)}
            aria-label={storeName}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[180px] object-contain"
              />
            ) : (
              <span className="text-lg sm:text-xl font-extrabold text-[var(--dk-cta)] whitespace-nowrap tracking-tight">
                {storeName}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            <MegaMenuTrigger
              active={megaOpen}
              onClick={() => {
                setMegaOpen((v) => !v);
                setSearchOpen(false);
                setCartHover(false);
              }}
            />
          </div>

          <div className="hidden md:block flex-1 max-w-2xl ms-2">
            <SearchField className="w-full" />
          </div>

          <div className="flex items-center gap-0.5 ms-auto shrink-0">
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-xs font-medium px-2 py-2.5 rounded-xl hover:bg-[var(--dk-surface)] text-[#3f4064] min-h-11"
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline max-w-[110px] truncate">
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
                className="relative flex items-center justify-center p-2.5 rounded-xl hover:bg-[var(--dk-surface)] min-w-11 min-h-11"
                aria-label="سبد خرید"
                onClick={() => setCartHover(false)}
              >
                <ShoppingCart className="w-5 h-5 text-[#3f4064]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 start-1 bg-[var(--dk-cta)] text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
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

        {/* Row 2: full-width search on mobile */}
        <div className="pb-2.5 md:hidden">
          <SearchField className="w-full" />
        </div>
      </div>

      {mobileMenu && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="dk-container py-3 space-y-1">
            <button
              type="button"
              className="w-full text-start px-3 py-3 rounded-xl bg-[var(--dk-surface)] text-sm font-medium text-[#3f4064]"
              onClick={() => {
                setMegaOpen(true);
                setMobileMenu(false);
              }}
            >
              دسته‌بندی کالاها
            </button>
            <Link
              to="/shop"
              className="block px-3 py-3 text-sm text-[#3f4064] rounded-xl hover:bg-[var(--dk-surface)]"
              onClick={() => setMobileMenu(false)}
            >
              فروشگاه
            </Link>
            <Link
              to="/account"
              className="block px-3 py-3 text-sm text-[#3f4064] rounded-xl hover:bg-[var(--dk-surface)]"
              onClick={() => setMobileMenu(false)}
            >
              حساب کاربری
            </Link>
            <Link
              to="/cart"
              className="block px-3 py-3 text-sm text-[#3f4064] rounded-xl hover:bg-[var(--dk-surface)]"
              onClick={() => setMobileMenu(false)}
            >
              سبد خرید ({toFarsiDigits(cartCount)})
            </Link>
          </div>
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
