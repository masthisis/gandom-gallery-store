import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function CmsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.pageBySlug(slug!);
        const list = res?.data || [];
        setPage(list[0] || null);
      } catch {
        setPage(null);
      }
    })();
  }, [slug]);

  if (!page) {
    return (
      <div className="dk-container py-16 text-center text-[var(--dk-muted)]">صفحه یافت نشد</div>
    );
  }

  const title = page.title || page.attributes?.title;
  const body = page.body || page.attributes?.body || '';

  return (
    <div className="dk-container py-10 max-w-3xl">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div
        className="prose prose-sm leading-8 text-[var(--dk-text)]"
        dangerouslySetInnerHTML={{
          __html: typeof body === 'string' && body.includes('<') ? body : `<p>${body}</p>`,
        }}
      />
    </div>
  );
}
