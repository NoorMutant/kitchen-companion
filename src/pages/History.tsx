import { useState, useMemo } from 'react';
import { useStore, InventoryLogAction } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, ShoppingCart, Filter } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, subDays, subWeeks, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const DATE_PRESETS = [
  { label: 'Today', getDates: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Last 7 Days', getDates: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: 'Last 30 Days', getDates: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: 'This Month', getDates: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Week', getDates: () => ({ from: startOfDay(subWeeks(new Date(), 1)), to: endOfDay(subDays(new Date(), 0)) }) },
];

const ACTION_COLORS: Record<InventoryLogAction, string> = {
  added: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  edited: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  deleted: 'bg-red-500/15 text-red-700 border-red-500/30',
  restocked: 'bg-violet-500/15 text-violet-700 border-violet-500/30',
  deducted: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
};

const ACTION_LABELS: Record<InventoryLogAction, string> = {
  added: 'Added',
  edited: 'Edited',
  deleted: 'Deleted',
  restocked: 'Restocked',
  deducted: 'Deducted',
};

const ALL_ACTIONS: InventoryLogAction[] = ['added', 'edited', 'deleted', 'restocked', 'deducted'];

const History = () => {
  const { inventoryLogs, orders } = useStore();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(DATE_PRESETS[0].getDates());
  const [activePreset, setActivePreset] = useState('Today');
  const [selectedActions, setSelectedActions] = useState<Set<InventoryLogAction>>(new Set(ALL_ACTIONS));
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const toggleAction = (action: InventoryLogAction) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(action)) { next.delete(action); } else { next.add(action); }
      return next;
    });
  };

  const isInRange = (date: Date) => {
    const d = new Date(date);
    return isWithinInterval(d, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
  };

  const filteredLogs = useMemo(() =>
    inventoryLogs
      .filter(log => selectedActions.has(log.action) && isInRange(log.timestamp)),
    [inventoryLogs, selectedActions, dateRange]
  );

  const filteredOrders = useMemo(() =>
    orders.filter(order => isInRange(order.timestamp)),
    [orders, dateRange]
  );

  const handlePreset = (label: string) => {
    const preset = DATE_PRESETS.find(p => p.label === label);
    if (preset) {
      setDateRange(preset.getDates());
      setActivePreset(label);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">View inventory logs and order history</p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Presets */}
        <div className="flex gap-1.5 flex-wrap">
          {DATE_PRESETS.map(p => (
            <Button
              key={p.label}
              variant={activePreset === p.label ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePreset(p.label)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Custom Date Range */}
        <div className="flex items-center gap-2">
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(dateRange.from, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(d) => { if (d) { setDateRange(prev => ({ ...prev, from: d })); setActivePreset(''); setFromOpen(false); } }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-sm">to</span>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(dateRange.to, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(d) => { if (d) { setDateRange(prev => ({ ...prev, to: d })); setActivePreset(''); setToOpen(false); } }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory" className="gap-1.5">
            <Package className="h-4 w-4" />
            Inventory Logs
            <Badge variant="secondary" className="ml-1 text-xs">{filteredLogs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            POS Orders
            <Badge variant="secondary" className="ml-1 text-xs">{filteredOrders.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Inventory Logs Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Action Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
            {ALL_ACTIONS.map(action => (
              <button
                key={action}
                onClick={() => toggleAction(action)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                  selectedActions.has(action) ? ACTION_COLORS[action] : 'bg-muted/50 text-muted-foreground border-transparent opacity-50'
                )}
              >
                {ACTION_LABELS[action]}
              </button>
            ))}
          </div>

          <ScrollArea className="h-[calc(100vh-340px)]">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No inventory logs for selected period</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Badge variant="outline" className={cn('shrink-0 text-xs', ACTION_COLORS[log.action])}>
                      {ACTION_LABELS[log.action]}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.materialName}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(log.timestamp), 'MMM dd, hh:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* POS Orders Tab */}
        <TabsContent value="pos" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No orders for selected period</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div key={order.id} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">{order.id}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.timestamp), 'MMM dd, yyyy — hh:mm a')}
                        </span>
                      </div>
                      <span className="font-bold text-primary">Rs. {order.total.toLocaleString()}</span>
                    </div>
                    <div className="grid gap-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.menuItem.icon} {item.menuItem.name} × {item.quantity}
                          </span>
                          <span>Rs. {(item.menuItem.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>Subtotal: Rs. {order.subtotal.toLocaleString()}</span>
                      <span>Tax: Rs. {order.tax.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
