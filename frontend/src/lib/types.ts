export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount?: number;
  children?: Category[];
  parent?: Category | null;
}

export interface VariantOption {
  id: string;
  value: string;
  priceModifier: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: VariantOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  isSale: boolean;
  stock: number;
  sku?: string;
  weight?: number | null;
  images: string[];
  specifications?: Record<string, string>;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTopSeller: boolean;
  category?: Category | null;
  brand?: Brand | null;
  variants?: ProductVariant[];
  ratings: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  author: string;
  avatar?: string | null;
  createdAt: string;
}

export interface ReviewSummary {
  reviews: Review[];
  breakdown: { star: number; count: number }[];
  average: number;
  total: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin';
  phone?: string;
  avatar?: string;
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id?: string;
  label?: string;
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
  isDefault?: boolean;
}

export interface CartLine {
  /** local id: productId + variant hash */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  variantSelection?: Record<string, string>;
}

export interface OrderItem {
  id: string;
  productName: string;
  productSlug?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variantSelection?: Record<string, string> | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  statusHistory?: { status: string; at: string }[];
  createdAt: string;
  user?: User | null;
}

export interface Banner {
  id: string;
  type: 'hero' | 'promo';
  title: string;
  subtitle?: string;
  tag?: string;
  image?: string;
  link?: string;
  ctaLabel?: string;
  active: boolean;
  sortOrder: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  published: boolean;
  author: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  active: boolean;
}
