export interface Product {
  id: number;
  title: string;
  titleFa: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  isIncredible?: boolean;
  image: string;
  descriptionFa?: string;
  sellerName?: string;
  category?: {
    id: number;
    name: string;
    nameFa: string;
    slug: string;
  };
}

export interface Category {
  id: number;
  name: string;
  nameFa: string;
  slug: string;
  icon?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
  }>;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

export function toFarsiDigits(str: string | number): string {
  return String(str).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
}
