import React from 'react';
import type { Product } from '../types';
import { formatPrice, toFarsiDigits } from '../types';
import { Star, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
      {/* Incredible Offer Badge */}
      {product.isIncredible && (
        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          شگفت‌انگیز
        </span>
      )}

      <div>
        {/* Product Image */}
        <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.titleFa}
            className="h-full w-full object-contain p-2 group-hover:scale-105 transition duration-300"
          />
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{product.sellerName}</span>
        </div>

        {/* Title */}
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed mb-3 min-h-[36px]">
          {product.titleFa}
        </h3>
      </div>

      <div>
        {/* Rating & Fast Delivery */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-700">{toFarsiDigits(product.rating)}</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>ارسال سریع</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-3">
          <button
            onClick={() => onAddToCart(product)}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
            title="افزودن به سبد خرید"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>

          <div className="text-left">
            {hasDiscount && (
              <div className="flex items-center gap-1.5 justify-end">
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  %{toFarsiDigits(discountPercent)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            )}

            <div className="text-sm font-black text-gray-900 mt-0.5">
              {formatPrice(product.discountPrice || product.price)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
