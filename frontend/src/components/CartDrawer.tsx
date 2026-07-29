import React from 'react';
import type { CartItem } from '../types';
import { formatPrice, toFarsiDigits } from '../types';
import { X, Trash2, Plus, Minus, CheckCircle, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <ShoppingBag className="w-5 h-5 text-red-600" />
              <span>سبد خرید شما ({toFarsiDigits(items.length)} کالا)</span>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <ShoppingBag className="w-16 h-16 stroke-1 text-gray-300 mb-3" />
                <p className="font-semibold text-gray-600 mb-1">سبد خرید شما خالی است!</p>
                <p className="text-xs">می‌توانید برای مشاهده محصولات به صفحه اصلی مراجعه کنید.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 border border-gray-100 rounded-xl flex gap-3 items-center bg-gray-50/50"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.titleFa}
                    className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">
                      {item.product.titleFa}
                    </h4>

                    <div className="text-xs font-bold text-gray-900 mb-2">
                      {formatPrice(item.product.discountPrice || item.product.price)}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-2 py-1">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-4 text-center">
                          {toFarsiDigits(item.quantity)}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">مبلغ قابل پرداخت:</span>
                <span className="font-black text-base text-gray-900">{formatPrice(totalAmount)}</span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-red-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>ثبت و تکمیل سفارش</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
