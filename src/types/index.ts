export interface RawMaterial {
  id: string;
  name: string;
  unit: 'kg' | 'liters' | 'pieces';
  currentStock: number;
  reorderLevel: number;
}

export interface RecipeIngredient {
  materialId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Mains' | 'Sides' | 'Drinks' | 'Desserts';
  icon: string;
  recipe: RecipeIngredient[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp: Date;
}

export type UserRole = 'admin' | 'counter';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
