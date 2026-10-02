export interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  unit: string;
  category: string;
  rating: number;
  delivery: string;
  image: string;
  fallbackIcon?: string;
  badge?: string;
  isMithilaSpecial?: boolean;
  description?: string;
}

export interface Category {
  name: string;
  icon: string;
  isSignature?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryLocation {
  id: string;
  label: string;
  city: string;
  state: string;
  pincode?: string;
  displayName: string;
  isCurrentLocation?: boolean;
}

export type PriceRange = "all" | "under-100" | "100-250" | "250-500" | "500-plus";

export type DiscountThreshold = 0 | 10 | 20 | 30;

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "discount-desc"
  | "name-asc";

export interface FilterState {
  priceRange: PriceRange;
  discountThreshold: DiscountThreshold;
  specialOnly: boolean;
}

