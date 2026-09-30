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
