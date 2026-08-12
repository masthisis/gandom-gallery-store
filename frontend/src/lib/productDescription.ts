import { mediaUrl } from './format';

const IMG_CLASS =
  'my-4 max-w-full rounded-xl border border-gray-100 bg-[var(--dk-surface)]';

function resolveDescUrl(url: string): string {
  const resolved = mediaUrl(url, 'large');
  return resolved || url;
}

function looksLikeHtml(text: string): boolean {
  return /<(?:p|br|img|figure|div|ul|ol|li|h[1-6]|strong|em|a)\b/i.test(text);
}

function convertMarkdownInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
      const resolved = resolveDescUrl(String(src).trim());
      const safeAlt = String(alt).replace(/"/g, '&quot;');
      return `<figure class="my-4"><img src="${resolved}" alt="${safeAlt}" class="${IMG_CLASS}" loading="lazy" decoding="async" /></figure>`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const resolved = resolveDescUrl(String(href).trim());
      return `<a href="${resolved}" class="text-[var(--dk-cta)] hover:underline">${label}</a>`;
    });
}

function normalizeHtmlImages(html: string): string {
  return html.replace(/<img([^>]*)\ssrc="([^"]+)"/gi, (_m, attrs, src) => {
    const resolved = resolveDescUrl(src);
    return `<img${attrs} src="${resolved}"`;
  });
}

/** Turn CMS product description (HTML or Markdown) into safe storefront HTML. */
export function productDescriptionHtml(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';

  // Markdown images/links may appear after HTML paragraphs from the rich-text editor.
  let html = convertMarkdownInline(trimmed);

  if (looksLikeHtml(html)) {
    return normalizeHtmlImages(html);
  }

  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const line = block.trim();
      if (!line) return '';
      if (line.startsWith('<figure')) return line;
      return `<p class="mb-4 last:mb-0">${line.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}
