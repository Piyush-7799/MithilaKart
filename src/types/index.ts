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
}

export interface Category {
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
