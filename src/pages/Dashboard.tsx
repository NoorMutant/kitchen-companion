import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const orders = useStore(s => s.orders);
  const materials = useStore(s => s.materials);

  const today = new Date();
  const todayOrders = orders.filter(o => {
    const d = new Date(o.timestamp);
    return d.toDateString() === today.toDateString();
  });

  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const lowStock = materials.filter(m => m.currentStock <= m.reorderLevel);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Rs. {todaySales.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayOrders.length}</p>
          </CardContent>
        </Card>

        <Card className={lowStock.length > 0 ? 'border-destructive/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStock.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{lowStock.length}</p>
            {lowStock.length > 0 && (
              <div className="mt-2 space-y-1">
                {lowStock.map(m => (
                  <p key={m.id} className="text-xs text-destructive">
                    {m.name}: {m.currentStock} {m.unit} remaining
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.timestamp).toLocaleString()} · {order.items.length} items
                    </p>
                  </div>
                  <p className="font-semibold">Rs. {order.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
