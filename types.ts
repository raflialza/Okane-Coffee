export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Order {
  id: string;
  timestamp: string; // e.g. ISO string or local string
  date: string; // e.g. YYYY-MM-DD for easy filtering
  items: CartItem[];
  total: number;
}
