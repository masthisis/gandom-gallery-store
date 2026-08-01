import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  Home,
  FileText,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { setAdminToken } from '../lib/api';

const links = [
  { to: '/', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/products', label: 'کالاها', icon: Package },
  { to: '/categories', label: 'دسته‌ها', icon: FolderTree },
  { to: '/orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { to: '/homepage', label: 'صفحه اصلی', icon: Home },
  { to: '/pages', label: 'صفحات', icon: FileText },
  { to: '/settings', label: 'تنظیمات', icon: Settings },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#23254e] text-white flex flex-col shrink-0">
        <div className="p-5 font-bold text-lg border-b border-white/10">گندم گالری</div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  isActive ? 'bg-[var(--color-cta,#ef4056)]' : 'hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 space-y-1 border-t border-white/10">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded-lg"
          >
            <ExternalLink className="w-4 h-4" />
            مشاهده فروشگاه
          </a>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded-lg w-full"
            onClick={() => {
              setAdminToken(null);
              navigate('/login');
            }}
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
