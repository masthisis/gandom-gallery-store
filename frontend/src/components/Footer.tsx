import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

const TRUST = [
  { icon: Truck, title: 'ارسال اکسپرس', text: 'تحویل سریع' },
  { icon: ShieldCheck, title: 'ضمانت اصل بودن', text: 'کالای اصل' },
  { icon: CreditCard, title: 'پرداخت امن', text: 'درگاه معتبر' },
  { icon: Headphones, title: 'پشتیبانی ۲۴/۷', text: 'همیشه در کنار شما' },
];

export function Footer() {
  return (
    <footer className="mt-12 bg-white border-t border-gray-200">
      <div className="dk-container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {TRUST.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--dk-surface)] flex items-center justify-center text-[var(--dk-muted)] shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#3f4064]">{item.title}</div>
                <div className="text-xs text-[var(--dk-muted)]">{item.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-4 text-sm border-t border-gray-100 pt-8">
          <div>
            <h3 className="font-bold text-[var(--dk-cta)] mb-3">گندم گالری</h3>
            <p className="text-[var(--dk-muted)] leading-7 text-xs">
              فروشگاه آنلاین محصولات دکوری، هنری و هدیه با ارسال سریع در سراسر ایران.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#3f4064] mb-3">با گندم گالری</h4>
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
        © گندم گالری — تمامی حقوق محفوظ است
      </div>
    </footer>
  );
}
