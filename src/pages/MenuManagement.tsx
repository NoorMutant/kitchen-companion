import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { MenuItem, RecipeIngredient } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES: MenuItem['category'][] = ['Mains', 'Sides', 'Drinks', 'Desserts'];
const ICONS = ['🍗', '🍚', '🍟', '🍢', '🥘', '🥤', '🥣', '🫓', '🍰', '🧁', '🥗', '🍔', '☕'];

const emptyForm = { name: '', price: 0, category: 'Mains' as MenuItem['category'], icon: '🍗', recipe: [] as RecipeIngredient[] };

const MenuManagement = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, materials } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (m: MenuItem) => {
    setEditing(m.id);
    setForm({ name: m.name, price: m.price, category: m.category, icon: m.icon, recipe: [...m.recipe] });
    setOpen(true);
  };

  const addIngredient = () => {
    if (materials.length === 0) return;
    setForm(f => ({ ...f, recipe: [...f.recipe, { materialId: materials[0].id, quantity: 0.1 }] }));
  };

  const removeIngredient = (idx: number) => {
    setForm(f => ({ ...f, recipe: f.recipe.filter((_, i) => i !== idx) }));
  };

  const updateIngredient = (idx: number, field: keyof RecipeIngredient, value: string | number) => {
    setForm(f => ({
      ...f,
      recipe: f.recipe.map((r, i) => i === idx ? { ...r, [field]: field === 'quantity' ? Number(value) : value } : r)
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (editing) {
      updateMenuItem(editing, form);
      toast.success('Menu item updated');
    } else {
      addMenuItem(form);
      toast.success('Menu item added');
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <span className="mr-2">{m.icon}</span>{m.name}
                  </TableCell>
                  <TableCell><Badge variant="secondary">{m.category}</Badge></TableCell>
                  <TableCell>Rs. {m.price}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.recipe.length === 0 ? '—' : m.recipe.map(r => {
                      const mat = materials.find(x => x.id === r.materialId);
                      return mat ? `${mat.name} (${r.quantity} ${mat.unit})` : 'Unknown';
                    }).join(', ')}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteMenuItem(m.id); toast.success('Deleted'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Price (Rs.)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as MenuItem['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={v => setForm({ ...form, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Recipe Mapping</Label>
                <Button type="button" variant="secondary" size="sm" onClick={addIngredient}>
                  <Plus className="h-3 w-3 mr-1" />Add Ingredient
                </Button>
              </div>
              {form.recipe.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={r.materialId} onValueChange={v => updateIngredient(idx, 'materialId', v)}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-24"
                    value={r.quantity}
                    onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground w-12">
                    {materials.find(m => m.id === r.materialId)?.unit || ''}
                  </span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.recipe.length === 0 && <p className="text-sm text-muted-foreground">No ingredients mapped.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
