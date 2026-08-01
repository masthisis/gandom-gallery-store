import { useEffect, useState } from 'react';
import { adminApi, listOf } from '../lib/api';

export function PagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  useEffect(() => {
    adminApi.pages().then((r) => setPages(listOf(r))).catch(() => setPages([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">صفحات ثابت</h1>
      <div className="bg-white border rounded-xl divide-y">
        {pages.map((p) => (
          <div key={p.id || p.documentId} className="p-4 flex justify-between">
            <span>{p.title || p.attributes?.title}</span>
            <span className="text-xs text-gray-500 dir-ltr">{p.slug || p.attributes?.slug}</span>
          </div>
        ))}
        {!pages.length && <p className="p-6 text-center text-gray-500">صفحه‌ای نیست — با seed ساخته می‌شود</p>}
      </div>
    </div>
  );
}
