'use strict';

module.exports = (plugin) => {
  const cat = plugin.contentTypes['product-category']?.schema;
  if (cat?.attributes) {
    cat.attributes.parent = {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::webbycommerce.product-category',
      inversedBy: 'children',
    };
    cat.attributes.children = {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::webbycommerce.product-category',
      mappedBy: 'parent',
    };
    cat.attributes.menu_order = { type: 'integer', default: 0 };
    cat.attributes.show_in_menu = { type: 'boolean', default: true };
  }

  const product = plugin.contentTypes['product']?.schema;
  if (product?.attributes) {
    if (product.info) {
      product.info.displayName = 'محصول';
      product.info.description = 'محصولات فروشگاه — قیمت، موجودی، تصاویر و دسته‌بندی';
    }
    // Custom specs editable in Strapi Admin Content Manager on Product
    product.attributes.specifications = {
      type: 'json',
      required: false,
      description: 'مشخصات فنی محصول به صورت JSON',
    };
    // Optional extra image URLs (used by seed / CDN); WC media `images` still primary
    product.attributes.gallery_urls = {
      type: 'json',
      required: false,
      description: 'آدرس تصاویر اضافی (JSON)',
    };
  }

  return plugin;
};
