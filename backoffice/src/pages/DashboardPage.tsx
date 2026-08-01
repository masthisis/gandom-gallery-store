import { useEffect, useState } from 'react';
import { adminApi, formatToman, listOf } from '../lib/api';

export function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [p, o] = await Promise.all([adminApi.products(), adminApi.orders()]);
        const products = listOf(p);
        const orders = listOf(o);
        const revenue = orders
          .filter((x) => x.payment_status === 'paid')
          .reduce((s, x) => s + Number(x.total || 0), 0);
        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
          pending: orders.filter((x) => x.status === 'pending' || x.payment_status === 'pending').length,
        });
      } catch {
        /* empty until API up */
      }
    })();
  }, []);

  const cards = [
    { label: 'تعداد کالا', value: String(stats.products) },
    { label: 'سفارش‌ها', value: String(stats.orders) },
    { label: 'درآمد (پرداخت‌شده)', value: formatToman(stats.revenue) },
    { label: 'در انتظار', value: String(stats.pending) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">داشبورد</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="text-xl font-bold mt-2">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
