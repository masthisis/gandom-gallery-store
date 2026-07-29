import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown, Percent, Zap, MapPin, Store } from 'lucide-react';
import { toFarsiDigits } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onSearch: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top Notification Bar */}
      <div className="bg-red-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 animate-pulse" />
        <span>جشنواره تخفیف‌های شگفت‌انگیز دیجی‌کالا | گندم گالری - ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان</span>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 text-red-600 font-extrabold text-2xl tracking-tighter">
            <span className="bg-red-600 text-white px-2.5 py-1 rounded-xl text-xl font-black">digikala</span>
            <span className="text-gray-800 text-sm font-semibold border-r border-gray-300 pr-3">گندم گالری</span>
          </a>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="جستجو در دیجی‌کالا (نام محصول، برند یا دسته‌بندی)..."
              className="w-full bg-gray-100 text-sm text-gray-800 rounded-lg pr-10 pl-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white border border-transparent focus:border-red-400 transition"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
          </form>
        </div>

        {/* User Actions & Cart */}
        <div className="flex items-center gap-3">
          {/* Backoffice Quick Link for Seller */}
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <Store className="w-4 h-4 text-red-600" />
            <span>پنل فروشندگان</span>
          </a>

          {/* User Account Login */}
          <button className="flex items-center gap-2 text-xs font-medium border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
            <User className="w-4 h-4" />
            <span>ورود | ثبت‌نام</span>
          </button>

          <span className="h-6 w-px bg-gray-200"></span>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {toFarsiDigits(cartCount)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Header */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-600">
        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-1 text-gray-900 font-bold hover:text-red-600">
            <Menu className="w-4 h-4" />
            <span>دسته‌بندی کالاها</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-gray-200"></span>

          <a href="#" className="flex items-center gap-1 hover:text-red-600 transition">
            <Percent className="w-3.5 h-3.5 text-red-600" />
            <span>شگفت‌انگیزها</span>
          </a>
          <a href="#" className="hover:text-red-600 transition">پرفروش‌ترین‌ها</a>
          <a href="#" className="hover:text-red-600 transition">تخفیف‌ها و پیشنهادها</a>
          <a href="#" className="hover:text-red-600 transition">سوالی دارید؟</a>
        </nav>

        <div className="hidden lg:flex items-center gap-1 text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>ارسال به تهران، منطقه ۱</span>
        </div>
      </div>
    </header>
  );
};
