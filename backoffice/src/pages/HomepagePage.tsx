import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';

export function HomepagePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi
      .homepage()
      .then((r) => {
        const d = r?.data || r;
        setSections(Array.isArray(d?.sections) ? d.sections : []);
        setSeoTitle(d?.seoTitle || '');
      })
      .catch(() => {});
  }, []);

  async function save() {
    setMsg('');
    try {
      await adminApi.saveHomepage({ sections, seoTitle });
      setMsg('ذخیره شد');
    } catch (e: any) {
      setMsg(e.message || 'خطا — دسترسی Strapi را بررسی کنید');
    }
  }

  function updateSlide(i: number, field: string, value: string) {
    setSections((prev) =>
      prev.map((s, idx) => {
        if (idx !== i && s.type !== 'hero_slider') return s;
        if (s.type !== 'hero_slider') return s;
        const slides = [...(s.slides || [{}])];
        slides[0] = { ...slides[0], [field]: value };
        return { ...s, slides };
      })
    );
  }

  const sliderIdx = sections.findIndex((s) => s.type === 'hero_slider');
  const slider = sliderIdx >= 0 ? sections[sliderIdx] : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">صفحه اصلی (CMS)</h1>
      <div className="bg-white border rounded-xl p-5 space-y-4 max-w-2xl">
        <label className="block text-sm">
          عنوان سئو
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </label>
        {slider && (
          <>
            <h2 className="font-semibold">اسلایدر اصلی</h2>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="عنوان اسلاید"
              value={slider.slides?.[0]?.title || ''}
              onChange={(e) => updateSlide(sliderIdx, 'title', e.target.value)}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="زیرعنوان"
              value={slider.slides?.[0]?.subtitle || ''}
              onChange={(e) => updateSlide(sliderIdx, 'subtitle', e.target.value)}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="آدرس تصویر"
              dir="ltr"
              value={slider.slides?.[0]?.image || ''}
              onChange={(e) => updateSlide(sliderIdx, 'image', e.target.value)}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="لینک"
              dir="ltr"
              value={slider.slides?.[0]?.link || ''}
              onChange={(e) => updateSlide(sliderIdx, 'link', e.target.value)}
            />
          </>
        )}
        <div>
          <h2 className="font-semibold mb-2">بخش‌ها (JSON)</h2>
          <textarea
            className="w-full border rounded-lg px-3 py-2 font-mono text-xs min-h-48"
            dir="ltr"
            value={JSON.stringify(sections, null, 2)}
            onChange={(e) => {
              try {
                setSections(JSON.parse(e.target.value));
              } catch {
                /* ignore while typing */
              }
            }}
          />
        </div>
        <button onClick={save} className="bg-[#ef4056] text-white px-5 py-2 rounded-lg">
          ذخیره صفحه اصلی
        </button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
