import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { mediaUrl } from '../lib/format';

export type StoreSettings = {
  storeName: string;
  logoUrl: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  currencyLabel?: string;
  shippingFlatToman?: number;
  seoTitle?: string | null;
};

const DEFAULTS: StoreSettings = {
  storeName: 'گندم گالری',
  logoUrl: null,
  currencyLabel: 'تومان',
  shippingFlatToman: 0,
  seoTitle: null,
};

const StoreSettingsContext = createContext<StoreSettings>(DEFAULTS);

function normalizeStore(raw: unknown): StoreSettings {
  const r = (raw as { data?: Record<string, unknown> })?.data || (raw as Record<string, unknown>) || {};
  const logoField = r.logo;
  const logoUrl =
    (typeof r.logoUrl === 'string' && r.logoUrl) ||
    mediaUrl(logoField) ||
    null;
  const seo = (r.seoDefaults as { title?: string } | null) || null;

  return {
    storeName: String(r.storeName || DEFAULTS.storeName),
    logoUrl,
    phone: (r.phone as string) || null,
    email: (r.email as string) || null,
    address: (r.address as string) || null,
    currencyLabel: String(r.currencyLabel || DEFAULTS.currencyLabel),
    shippingFlatToman: Number(r.shippingFlatToman ?? 0) || 0,
    seoTitle: seo?.title || null,
  };
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    api
      .storeSettings()
      .then((res) => {
        if (cancelled) return;
        const next = normalizeStore(res);
        setSettings(next);
        document.title = next.seoTitle || `${next.storeName} | فروشگاه آنلاین`;
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
