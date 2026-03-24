import { Order } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const ReceiptModal = ({ order, open, onClose }: Props) => {
  if (!order) return null;

  const handlePrint = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Order Receipt</DialogTitle>
        </DialogHeader>
        <div className="print-receipt font-mono text-sm space-y-3 p-4 bg-card rounded-lg border">
          <div className="text-center space-y-1">
            <p className="text-base font-bold">🍽️ Restaurant POS</p>
            <p className="text-xs text-muted-foreground">Order #{order.id}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.timestamp).toLocaleString()}</p>
          </div>
          <div className="border-t border-dashed pt-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-0.5">
                <span>{item.quantity}x {item.menuItem.name}</span>
                <span>Rs. {(item.menuItem.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5%)</span>
              <span>Rs. {order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>Total</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground pt-2">Thank you for your visit!</p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
