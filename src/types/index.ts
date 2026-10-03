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

export type AddressLabel = "Home" | "Work" | "Other";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  label: AddressLabel;
}

export interface DeliveryLocation {
  id: string;
  label: string;
  city: string;
  state: string;
  pincode?: string;
  displayName: string;
  isCurrentLocation?: boolean;
  address?: Address;
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

export interface DeliveryEtaInfo {
  etaText: string;
  minMinutes: number;
  maxMinutes: number;
  serviceabilityStatus: string;
  reason: string;
}

export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  mrp?: number;
  unit?: string;
  lineTotal: number;
}

export interface AddressSnapshot {
  id?: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  label: AddressLabel | string;
  displayName?: string;
}

export interface Order {
  id: string;
  createdAt: string; // ISO 8601 string
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  savings: number;
  deliveryEta: string;
  address: AddressSnapshot;
  paymentMethod: string;
  estimatedDelivery: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}


