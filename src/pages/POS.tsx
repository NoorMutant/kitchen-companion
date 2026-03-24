import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingCart, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ReceiptModal from '@/components/ReceiptModal';
import { Order, MenuItem } from '@/types';

const CATEGORIES = ['All', 'Mains', 'Sides', 'Drinks', 'Desserts'] as const;

const POS = () => {
  const { menuItems, cart, addToCart, updateCartQty, removeFromCart, completeOrder, logout, user, materials } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(m => m.category === activeCategory);
  const subtotal = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const handleComplete = () => {
    const order = completeOrder();
    if (order) {
      toast.success('Order completed!');
      // Check low stock after order
      const updatedMaterials = useStore.getState().materials;
      const lowStock = updatedMaterials.filter(m => m.currentStock <= m.reorderLevel);
      lowStock.forEach(m => toast.warning(`Warning: ${m.name} stock is low (${m.currentStock} ${m.unit})`));
      setReceiptOrder(order);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍽️</span>
          <h1 className="text-lg font-bold">POS Terminal</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          {user?.role === 'admin' && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Menu Grid */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Items Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(item => (
                <button
                  key={item.id}
                  className="pos-grid-item text-left"
                  onClick={() => addToCart(item)}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-medium text-sm text-center leading-tight">{item.name}</span>
                  <span className="text-primary font-bold text-sm">Rs. {item.price}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Panel */}
        <div className="w-80 lg:w-96 border-l bg-card flex flex-col shrink-0">
          <div className="p-4 border-b flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Current Order</h2>
            <Badge className="ml-auto">{cart.length}</Badge>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No items in cart</p>
            ) : (
              <div className="space-y-3">
                {cart.map(c => (
                  <div key={c.menuItem.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <span className="text-xl">{c.menuItem.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">Rs. {c.menuItem.price} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateCartQty(c.menuItem.id, c.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{c.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateCartQty(c.menuItem.id, c.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(c.menuItem.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totals */}
          <div className="p-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>Rs. {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
            <Button
              className="w-full mt-2"
              size="lg"
              disabled={cart.length === 0}
              onClick={handleComplete}
            >
              Complete Order
            </Button>
          </div>
        </div>
      </div>

      <ReceiptModal order={receiptOrder} open={!!receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
};

export default POS;
