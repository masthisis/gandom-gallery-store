import { useEffect, useState } from 'react';
import { adminApi, formatToman, listOf } from '../lib/api';

const STATUS_FA: Record<string, string> = {
  pending: 'در انتظار',
  processing: 'پردازش',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل',
  cancelled: 'لغو',
  refunded: 'مسترد',
};

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  async function load() {
    try {
      setOrders(listOf(await adminApi.orders()));
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(order: any, status: string) {
    try {
      await adminApi.updateOrder(order.documentId || order.id, { status });
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">سفارش‌ها</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id || o.order_number} className="bg-white border rounded-xl p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="font-bold">{o.order_number || o.id}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {STATUS_FA[o.status] || o.status} · پرداخت: {o.payment_status} · {formatToman(o.total)}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    className="text-xs border rounded-lg px-2 py-1 hover:bg-gray-50"
                    onClick={() => setStatus(o, s)}
                  >
                    {STATUS_FA[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!orders.length && <p className="text-gray-500 text-center py-10">سفارشی نیست</p>}
      </div>
    </div>
  );
}
