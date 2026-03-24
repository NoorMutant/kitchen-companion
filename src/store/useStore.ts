import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RawMaterial, MenuItem, CartItem, Order, User } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Inventory
  materials: RawMaterial[];
  addMaterial: (m: Omit<RawMaterial, 'id'>) => void;
  updateMaterial: (id: string, m: Partial<RawMaterial>) => void;
  deleteMaterial: (id: string) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (m: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, m: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  completeOrder: () => Order | null;
}

const TAX_RATE = 0.05;

const defaultMaterials: RawMaterial[] = [
  { id: '1', name: 'Raw Chicken', unit: 'kg', currentStock: 25, reorderLevel: 5 },
  { id: '2', name: 'Potatoes', unit: 'kg', currentStock: 40, reorderLevel: 10 },
  { id: '3', name: 'Cooking Oil', unit: 'liters', currentStock: 15, reorderLevel: 3 },
  { id: '4', name: 'Tomatoes', unit: 'kg', currentStock: 20, reorderLevel: 5 },
  { id: '5', name: 'Rice', unit: 'kg', currentStock: 30, reorderLevel: 8 },
  { id: '6', name: 'Onions', unit: 'kg', currentStock: 18, reorderLevel: 5 },
  { id: '7', name: 'Spice Mix', unit: 'kg', currentStock: 4, reorderLevel: 2 },
  { id: '8', name: 'Soft Drink Syrup', unit: 'liters', currentStock: 10, reorderLevel: 3 },
];

const defaultMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Chicken Karahi', price: 850, category: 'Mains', icon: '🍗', recipe: [{ materialId: '1', quantity: 0.5 }, { materialId: '4', quantity: 0.2 }, { materialId: '7', quantity: 0.05 }] },
  { id: 'm2', name: 'Chicken Biryani', price: 650, category: 'Mains', icon: '🍚', recipe: [{ materialId: '1', quantity: 0.4 }, { materialId: '5', quantity: 0.3 }, { materialId: '6', quantity: 0.1 }] },
  { id: 'm3', name: 'French Fries', price: 250, category: 'Sides', icon: '🍟', recipe: [{ materialId: '2', quantity: 0.3 }, { materialId: '3', quantity: 0.1 }] },
  { id: 'm4', name: 'Chicken Tikka', price: 550, category: 'Mains', icon: '🍢', recipe: [{ materialId: '1', quantity: 0.35 }, { materialId: '7', quantity: 0.03 }] },
  { id: 'm5', name: 'Dal Chawal', price: 350, category: 'Mains', icon: '🥘', recipe: [{ materialId: '5', quantity: 0.25 }, { materialId: '6', quantity: 0.1 }] },
  { id: 'm6', name: 'Soft Drink', price: 120, category: 'Drinks', icon: '🥤', recipe: [{ materialId: '8', quantity: 0.05 }] },
  { id: 'm7', name: 'Raita', price: 100, category: 'Sides', icon: '🥣', recipe: [] },
  { id: 'm8', name: 'Naan', price: 50, category: 'Sides', icon: '🫓', recipe: [] },
];

const USERS: { username: string; password: string; user: User }[] = [
  { username: 'admin', password: 'admin123', user: { id: 'u1', name: 'Admin', role: 'admin' } },
  { username: 'counter', password: 'counter123', user: { id: 'u2', name: 'Counter Staff', role: 'counter' } },
];

let idCounter = 100;
const genId = () => String(++idCounter);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (username, password) => {
        const found = USERS.find(u => u.username === username && u.password === password);
        if (found) { set({ user: found.user }); return true; }
        return false;
      },
      logout: () => set({ user: null, cart: [] }),

      materials: defaultMaterials,
      addMaterial: (m) => set(s => ({ materials: [...s.materials, { ...m, id: genId() }] })),
      updateMaterial: (id, m) => set(s => ({ materials: s.materials.map(x => x.id === id ? { ...x, ...m } : x) })),
      deleteMaterial: (id) => set(s => ({ materials: s.materials.filter(x => x.id !== id) })),

      menuItems: defaultMenuItems,
      addMenuItem: (m) => set(s => ({ menuItems: [...s.menuItems, { ...m, id: genId() }] })),
      updateMenuItem: (id, m) => set(s => ({ menuItems: s.menuItems.map(x => x.id === id ? { ...x, ...m } : x) })),
      deleteMenuItem: (id) => set(s => ({ menuItems: s.menuItems.filter(x => x.id !== id) })),

      cart: [],
      addToCart: (item) => set(s => {
        const existing = s.cart.find(c => c.menuItem.id === item.id);
        if (existing) return { cart: s.cart.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) };
        return { cart: [...s.cart, { menuItem: item, quantity: 1 }] };
      }),
      removeFromCart: (itemId) => set(s => ({ cart: s.cart.filter(c => c.menuItem.id !== itemId) })),
      updateCartQty: (itemId, qty) => set(s => {
        if (qty <= 0) return { cart: s.cart.filter(c => c.menuItem.id !== itemId) };
        return { cart: s.cart.map(c => c.menuItem.id === itemId ? { ...c, quantity: qty } : c) };
      }),
      clearCart: () => set({ cart: [] }),

      orders: [],
      completeOrder: () => {
        const { cart, materials } = get();
        if (cart.length === 0) return null;

        const subtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
        const tax = Math.round(subtotal * TAX_RATE);
        const total = subtotal + tax;

        const order: Order = {
          id: `ORD-${Date.now().toString(36).toUpperCase()}`,
          items: [...cart],
          subtotal, tax, total,
          timestamp: new Date(),
        };

        // Deduct inventory
        const updatedMaterials = [...materials];
        for (const cartItem of cart) {
          for (const ingredient of cartItem.menuItem.recipe) {
            const mat = updatedMaterials.find(m => m.id === ingredient.materialId);
            if (mat) {
              mat.currentStock = Math.max(0, mat.currentStock - ingredient.quantity * cartItem.quantity);
            }
          }
        }

        set(s => ({ orders: [order, ...s.orders], cart: [], materials: updatedMaterials }));
        return order;
      },
    }),
    { name: 'restaurant-pos-store' }
  )
);
