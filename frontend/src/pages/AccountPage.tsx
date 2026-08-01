import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Heart,
  MessageSquare,
  LogOut,
  User,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { api, getToken, setToken } from '../lib/api';
import { ORDER_STATUS_FA, PAYMENT_STATUS_FA, formatPrice } from '../lib/format';
import { AddressFields } from '../components/AddressFields';
import {
  EMPTY_ADDRESS,
  isValidPersianName,
  normalizeIranMobile,
  type AddressFormValues,
} from '../lib/iranValidation';

type Section = 'orders' | 'profile' | 'addresses' | 'wishlist' | 'messages';

const MENU: { key: Section; label: string; icon: typeof Package }[] = [
  { key: 'orders', label: 'سفارش‌ها', icon: Package },
  { key: 'profile', label: 'اطلاعات حساب', icon: User },
  { key: 'addresses', label: 'آدرس‌ها', icon: MapPin },
  { key: 'wishlist', label: 'علاقه‌مندی‌ها', icon: Heart },
  { key: 'messages', label: 'پیام‌ها', icon: MessageSquare },
];

export function AccountPage({
  user,
  onNeedAuth,
  onLogout,
  onUserUpdate,
}: {
  user: Record<string, unknown> | null;
  onNeedAuth: () => void;
  onLogout: () => void;
  onUserUpdate?: (u: Record<string, unknown>) => void;
}) {
  const [section, setSection] = useState<Section>('orders');
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [addresses, setAddresses] = useState<Record<string, unknown>[]>([]);
  const [favorites, setFavorites] = useState<Record<string, unknown>[]>([]);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [addrForm, setAddrForm] = useState<AddressFormValues>({ ...EMPTY_ADDRESS });
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    phone_no: '',
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function reload() {
    if (!getToken()) return;
    api.wc
      .orders()
      .then((res) => {
        const r = res as Record<string, unknown>;
        const list = Array.isArray(res) ? res : r?.data || r?.orders || [];
        setOrders(Array.isArray(list) ? (list as Record<string, unknown>[]) : []);
      })
      .catch(() => setOrders([]));

    api
      .profileMe()
      .then((res) => {
        const u = res?.data?.user;
        if (u) {
          setProfileForm({
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            display_name: u.display_name || '',
            phone_no: u.phone_no || '',
          });
          onUserUpdate?.(u);
          localStorage.setItem('gandom_user', JSON.stringify(u));
        }
        setAddresses(res?.data?.addresses || []);
      })
      .catch(() => {
        api.wc
          .addresses()
          .then((res) => {
            const r = res as Record<string, unknown>;
            const list = Array.isArray(res) ? res : r?.data || [];
            setAddresses(Array.isArray(list) ? (list as Record<string, unknown>[]) : []);
          })
          .catch(() => setAddresses([]));
      });

    api
      .favorites()
      .then((res) => setFavorites(res?.data || []))
      .catch(() => setFavorites([]));
  }

  useEffect(() => {
    reload();
  }, [user]);

  if (!getToken() || !user) {
    return (
      <div className="dk-container py-20 text-center">
        <User className="w-16 h-16 text-[var(--dk-muted)] mx-auto mb-4 opacity-40" />
        <p className="mb-4 text-[var(--dk-muted)]">برای مشاهده حساب کاربری وارد شوید</p>
        <button onClick={onNeedAuth} className="bg-[var(--dk-cta)] text-white px-8 py-3 rounded-xl font-medium">
          ورود | ثبت‌نام
        </button>
      </div>
    );
  }

  function logout() {
    setToken(null);
    localStorage.removeItem('gandom_user');
    onLogout();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (!isValidPersianName(profileForm.first_name) || !isValidPersianName(profileForm.last_name)) {
      setMsg('نام و نام خانوادگی باید فارسی باشند');
      return;
    }
    const phone = normalizeIranMobile(profileForm.phone_no);
    if (!phone) {
      setMsg('موبایل نامعتبر است');
      return;
    }
    setSaving(true);
    try {
      const res = await api.updateProfile({ ...profileForm, phone_no: phone });
      onUserUpdate?.(res.data);
      localStorage.setItem('gandom_user', JSON.stringify(res.data));
      setMsg('اطلاعات ذخیره شد');
    } catch (err: any) {
      setMsg(err.message || 'خطا');
    } finally {
      setSaving(false);
    }
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      if (editingId === 'new') {
        await api.createProfileAddress(addrForm);
      } else if (editingId) {
        await api.updateProfileAddress(editingId, addrForm);
      }
      setEditingId(null);
      reload();
      setMsg('آدرس ذخیره شد');
    } catch (err: any) {
      setMsg(err.message || 'خطا در ذخیره آدرس');
    } finally {
      setSaving(false);
    }
  }

  async function removeAddress(id: number) {
    if (!confirm('آدرس حذف شود؟')) return;
    await api.deleteProfileAddress(id).catch(() => {});
    reload();
  }

  async function removeFav(slug: string) {
    await api.removeFavorite(slug).catch(() => {});
    reload();
  }

  return (
    <div className="dk-container py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-[var(--dk-surface)]">
              <div className="font-bold text-[#3f4064]">{String(user.display_name || 'کاربر')}</div>
              <div className="text-xs text-[var(--dk-muted)] mt-1" dir="ltr">
                {String(user.phone_no || '')}
              </div>
            </div>
            <nav className="p-2">
              {MENU.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSection(item.key);
                    setMsg('');
                    setEditingId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                    section === item.key
                      ? 'bg-[#fff0f2] text-[var(--dk-cta)] font-medium'
                      : 'text-[#3f4064] hover:bg-[var(--dk-surface)]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 mt-1"
              >
                <LogOut className="w-5 h-5" />
                خروج از حساب
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1 bg-white rounded-2xl shadow-sm p-5 md:p-6 min-h-[400px]">
          {msg && <p className="text-sm text-[var(--dk-cta)] mb-4">{msg}</p>}

          {section === 'orders' && (
            <>
              <h2 className="font-bold text-[#3f4064] mb-4">سفارش‌های من</h2>
              {!orders.length ? (
                <div className="text-center py-12 text-[var(--dk-muted)] text-sm">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  هنوز سفارشی ثبت نکرده‌اید
                  <Link to="/shop" className="block mt-4 text-[var(--dk-cta)]">
                    شروع خرید
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={String(o.id || o.order_number)} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-start text-sm">
                        <span className="font-medium text-[#3f4064]">سفارش {String(o.order_number || o.id)}</span>
                        <span className="text-[var(--dk-cta)]">
                          {ORDER_STATUS_FA[String(o.status)] || String(o.status)}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--dk-muted)] mt-2 flex justify-between">
                        <span>{PAYMENT_STATUS_FA[String(o.payment_status)] || String(o.payment_status)}</span>
                        <span className="font-bold text-[#3f4064]">{formatPrice(Number(o.total))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {section === 'profile' && (
            <>
              <h2 className="font-bold text-[#3f4064] mb-4">اطلاعات حساب</h2>
              <form onSubmit={saveProfile} className="grid gap-3 max-w-md">
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="نام"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="نام خانوادگی"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="نام نمایشی"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                />
                <input
                  dir="ltr"
                  className="border rounded-lg px-3 py-2"
                  placeholder="موبایل"
                  value={profileForm.phone_no}
                  onChange={(e) => setProfileForm({ ...profileForm, phone_no: e.target.value })}
                />
                <button
                  disabled={saving}
                  className="bg-[var(--dk-cta)] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  ذخیره
                </button>
              </form>
            </>
          )}

          {section === 'addresses' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#3f4064]">آدرس‌های من</h2>
                {editingId == null && (
                  <button
                    type="button"
                    className="text-sm text-[var(--dk-cta)] inline-flex items-center gap-1"
                    onClick={() => {
                      setAddrForm({
                        ...EMPTY_ADDRESS,
                        phone: String(user.phone_no || ''),
                        firstName: String(user.first_name || ''),
                        lastName: String(user.last_name || ''),
                      });
                      setEditingId('new');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    آدرس جدید
                  </button>
                )}
              </div>

              {editingId != null && (
                <form onSubmit={saveAddress} className="border border-gray-100 rounded-xl p-4 mb-4 space-y-3">
                  <AddressFields value={addrForm} onChange={setAddrForm} />
                  <div className="flex gap-2">
                    <button
                      disabled={saving}
                      className="bg-[var(--dk-cta)] text-white text-sm px-4 py-2 rounded-xl disabled:opacity-50"
                    >
                      ذخیره آدرس
                    </button>
                    <button
                      type="button"
                      className="text-sm text-[var(--dk-muted)] px-3"
                      onClick={() => setEditingId(null)}
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}

              {!addresses.length && editingId == null ? (
                <p className="text-center text-[var(--dk-muted)] text-sm py-12">آدرسی ثبت نشده است</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div key={String(a.id)} className="border border-gray-100 rounded-xl p-4 text-sm">
                      <div className="flex justify-between gap-2">
                        <div className="font-medium">
                          {String(a.first_name)} {String(a.last_name)}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            className="text-[var(--dk-muted)] hover:text-[var(--dk-cta)]"
                            onClick={() => {
                              setAddrForm({
                                firstName: String(a.first_name || ''),
                                lastName: String(a.last_name || ''),
                                province: String(a.region || ''),
                                city: String(a.city || ''),
                                address: String(a.street_address || ''),
                                plaque: '',
                                unit: '',
                                postcode: String(a.postcode || ''),
                                phone: String(a.phone || ''),
                              });
                              setEditingId(Number(a.id));
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="text-[var(--dk-muted)] hover:text-red-600"
                            onClick={() => removeAddress(Number(a.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[var(--dk-muted)] mt-1 leading-6">
                        {String(a.region)}، {String(a.city)} — {String(a.street_address)}
                      </p>
                      <p className="text-xs text-[var(--dk-muted)] mt-1" dir="ltr">
                        {String(a.phone)} · {String(a.postcode)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {section === 'wishlist' && (
            <>
              <h2 className="font-bold text-[#3f4064] mb-4">علاقه‌مندی‌ها</h2>
              {!favorites.length ? (
                <div className="text-center py-12 text-[var(--dk-muted)] text-sm">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  هنوز محصولی به علاقه‌مندی‌ها اضافه نشده
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {favorites.map((f) => {
                    const p = (f.product || {}) as Record<string, unknown>;
                    const slug = String(f.productSlug || p.slug || '');
                    return (
                      <div
                        key={String(f.id || slug)}
                        className="border border-gray-100 rounded-xl p-4 flex justify-between gap-3"
                      >
                        <div>
                          <Link to={`/product/${slug}`} className="font-medium text-sm text-[#3f4064] hover:text-[var(--dk-cta)]">
                            {String(p.name || slug)}
                          </Link>
                          {p.price != null && (
                            <div className="text-xs text-[var(--dk-muted)] mt-1">
                              {formatPrice(Number(p.sale_price ?? p.price))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-red-500 shrink-0"
                          onClick={() => removeFav(slug)}
                          aria-label="حذف از علاقه‌مندی"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {section === 'messages' && (
            <div className="text-center py-12 text-[var(--dk-muted)] text-sm">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              پیامی وجود ندارد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
