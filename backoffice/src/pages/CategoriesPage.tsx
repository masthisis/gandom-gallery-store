import { useEffect, useState } from 'react';
import { adminApi, listOf } from '../lib/api';

export function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => {
    adminApi.categories().then((r) => setCats(listOf(r))).catch(() => setCats([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">دسته‌بندی‌ها</h1>
      <div className="bg-white rounded-xl border divide-y">
        {cats.map((c) => (
          <div key={c.id || c.slug} className="p-4 flex justify-between">
            <span className="font-medium">{c.name}</span>
            <span className="text-xs text-gray-500 dir-ltr">{c.slug}</span>
          </div>
        ))}
        {!cats.length && (
          <p className="p-6 text-gray-500 text-center">
            دسته‌ای نیست. با <code>GANDOM_SEED=true</code> یا Strapi Admin بسازید.
          </p>
        )}
      </div>
    </div>
  );
}
