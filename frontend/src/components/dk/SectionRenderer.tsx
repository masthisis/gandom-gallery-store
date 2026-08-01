import { HeroSlider } from './HeroSlider';
import { StoryRow } from './StoryRow';
import { IncredibleOffers } from './IncredibleOffers';
import { ProductSlider } from './ProductSlider';
import { BannerGrid } from './BannerGrid';
import { CategoryGrid } from './CategoryGrid';
import { MixedSlider } from './MixedSlider';
import { TrustBadges } from './TrustBadges';
import type { HomeSection, MixedItem, StoryItem, TrustBadgeItem } from './types';
import type { ProductCardData } from '../ProductCard';

type Props = {
  sections: HomeSection[];
  fallbackProducts?: ProductCardData[];
  onAdd?: (p: ProductCardData) => void;
};

export function SectionRenderer({ sections, fallbackProducts = [], onAdd }: Props) {
  if (!sections.length && fallbackProducts.length) {
    return (
      <ProductSlider
        title="محصولات"
        products={fallbackProducts}
        link="/shop"
        onAdd={onAdd}
      />
    );
  }

  return (
    <>
      {sections.map((section, idx) => {
        const key = section.id ?? `${section.type}-${idx}`;
        const products =
          section.products?.length ? section.products : fallbackProducts;

        switch (section.type) {
          case 'hero_slider':
          case 'image_slider':
            return <HeroSlider key={key} slides={section.slides} />;

          case 'story_row':
            return (
              <StoryRow
                key={key}
                title={section.title}
                items={section.items as StoryItem[]}
              />
            );

          case 'incredible_offers':
            return (
              <IncredibleOffers
                key={key}
                title={section.title}
                products={products}
                endsAt={section.endsAt}
                limit={section.limit}
                onAdd={onAdd}
              />
            );

          case 'product_slider':
          case 'product_row':
            return (
              <ProductSlider
                key={key}
                title={section.title}
                products={products}
                link={section.link || '/shop'}
                limit={section.limit}
                onAdd={onAdd}
              />
            );

          case 'banner_grid':
            return (
              <BannerGrid key={key} title={section.title} banners={section.banners} />
            );

          case 'category_grid':
            return (
              <CategoryGrid key={key} title={section.title} categories={section.categories} />
            );

          case 'mixed_slider':
            return (
              <MixedSlider
                key={key}
                title={section.title}
                items={section.items as MixedItem[]}
                onAdd={onAdd}
              />
            );

          case 'trust_badges':
            return <TrustBadges key={key} items={section.items as TrustBadgeItem[]} />;

          default:
            return null;
        }
      })}
    </>
  );
}
