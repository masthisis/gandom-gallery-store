import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import type { TrustBadgeItem } from './types';

const ICONS = [Truck, ShieldCheck, RotateCcw, Headphones];

type Props = {
  items?: TrustBadgeItem[];
};

export function TrustBadges({ items = [] }: Props) {
  if (!items.length) return null;

  return (
    <section className="dk-container py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-[#fff0f2] text-[var(--dk-cta)] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#3f4064]">{item.title}</div>
                {item.text && <div className="text-xs text-[var(--dk-muted)] mt-0.5">{item.text}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
