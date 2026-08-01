import type { ProductCardData } from '../ProductCard';

export type SlideItem = {
  title?: string;
  subtitle?: string;
  image?: string | Record<string, unknown>;
  link?: string;
};

export type BannerItem = {
  title?: string;
  image?: string | Record<string, unknown>;
  link?: string;
};

export type StoryItem = {
  title?: string;
  image?: string | Record<string, unknown>;
  link?: string;
};

export type CategoryItem = {
  name: string;
  slug: string;
  commerceSlug?: string;
  image?: string | Record<string, unknown>;
  children?: CategoryItem[];
};

export type MixedItem =
  | { kind: 'image'; title?: string; image?: string | Record<string, unknown>; link?: string }
  | { kind: 'product'; product: ProductCardData };

export type TrustBadgeItem = {
  title?: string;
  text?: string;
  icon?: string;
};

export type HomeSection = {
  id?: string | number;
  type: string;
  title?: string;
  subtitle?: string;
  link?: string;
  limit?: number;
  endsAt?: string;
  slides?: SlideItem[];
  products?: ProductCardData[];
  banners?: BannerItem[];
  items?: StoryItem[] | MixedItem[] | TrustBadgeItem[];
  categories?: CategoryItem[];
};
