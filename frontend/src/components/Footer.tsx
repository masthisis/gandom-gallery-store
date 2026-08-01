import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';
import { useStoreSettings } from '../lib/store-settings';

const TRUST = [
  { icon: Truck, title: 'ارسال اکسپرس', text: 'تحویل سریع' },
  { icon: ShieldCheck, title: 'ضمانت اصل بودن', text: 'کالای اصل' },
  { icon: CreditCard, title: 'پرداخت امن', text: 'درگاه معتبر' },
  { icon: Headphones, title: 'پشتیبانی ۲۴/۷', text: 'همیشه در کنار شما' },
];

export function Footer() {
  const { storeName, logoUrl, address, phone } = useStoreSettings();

  return (
    <footer className="mt-8 sm:mt-12 bg-white border-t border-gray-200">
      <div className="dk-container py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {TRUST.map((item) => (
            <div key={item.title} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--dk-surface)] flex items-center justify-center text-[var(--dk-muted)] shrink-0">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-[#3f4064]">{item.title}</div>
                <div className="text-[11px] sm:text-xs text-[var(--dk-muted)]">{item.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4 text-sm border-t border-gray-100 pt-6 sm:pt-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto max-w-[140px] object-contain" />
              ) : (
                <h3 className="font-bold text-[var(--dk-cta)]">{storeName}</h3>
              )}
            </Link>
            <p className="text-[var(--dk-muted)] leading-7 text-xs">
              فروشگاه آنلاین محصولات دکوری، هنری و هدیه با ارسال سریع در سراسر ایران.
            </p>
            {(address || phone) && (
              <p className="text-[var(--dk-muted)] text-xs mt-2 leading-6">
                {address ? <span className="block">{address}</span> : null}
                {phone ? <span className="block">{phone}</span> : null}
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-[#3f4064] mb-3">با {storeName}</h4>
            <ul className="space-y-2 text-[var(--dk-muted)] text-xs">
              <li><Link to="/page/about" className="hover:text-[var(--dk-cta)]">درباره ما</Link></li>
              <li><Link to="/page/contact" className="hover:text-[var(--dk-cta)]">تماس با ما</Link></li>
              <li><Link to="/page/faq" className="hover:text-[var(--dk-cta)]">سوالات متداول</Link></li>
              <li><Link to="/shop" className="hover:text-[var(--dk-cta)]">فروشگاه</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#3f4064] mb-3">خدمات مشتریان</h4>
            <ul className="space-y-2 text-[var(--dk-muted)] text-xs">
              <li><Link to="/page/shipping" className="hover:text-[var(--dk-cta)]">روش‌های ارسال</Link></li>
              <li><Link to="/page/returns" className="hover:text-[var(--dk-cta)]">بازگشت کالا</Link></li>
              <li><Link to="/account" className="hover:text-[var(--dk-cta)]">پیگیری سفارش</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#3f4064] mb-3">قوانین</h4>
            <ul className="space-y-2 text-[var(--dk-muted)] text-xs">
              <li><Link to="/page/privacy" className="hover:text-[var(--dk-cta)]">حریم خصوصی</Link></li>
              <li><Link to="/page/terms" className="hover:text-[var(--dk-cta)]">قوانین و مقررات</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-[var(--dk-surface)] text-center text-xs text-[var(--dk-muted)] py-4">
        © {storeName} — تمامی حقوق محفوظ است
      </div>
    </footer>
  );
}
