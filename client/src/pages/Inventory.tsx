import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package2, AlertTriangle, TrendingDown, CheckCircle, Search, X,
  Plus, Minus, BarChart3, Tag, Filter, RefreshCw, ArrowUpRight
} from 'lucide-react';
import { useGetProducts } from '@/lib/api';

type Product = { id: number; name: string; brand: string; sku: string; category: string; price: number; stock: number; minStock: number; active: boolean; };

const catColors: Record<string, string> = {
  'Dry Food': 'bg-amber-100 text-amber-700', 'Wet Food': 'bg-blue-100 text-blue-700',
  'Treats': 'bg-pink-100 text-pink-700', 'Supplements': 'bg-violet-100 text-violet-700',
  'Accessories': 'bg-teal-100 text-teal-700',
};

export function Inventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'ok'>('all');
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [adjQty, setAdjQty] = useState(0);
  const [adjNote, setAdjNote] = useState('');

  const { data: products = [], isLoading } = useGetProducts();

  const adjustMutation = useMutation({
    mutationFn: async ({ id, delta }: { id: number; delta: number }) => {
      const r = await fetch(`/api/inventory/adjust`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, delta, note: adjNote }),
      });
      if (!r.ok) {
        const prod = products.find(p => p.id === id)!;
        const newStock = prod.stock + delta;
        await fetch(`/api/products/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: newStock }) });
      }
      return true;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setAdjusting(null); setAdjQty(0); setAdjNote(''); },
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const isLow = p.stock > 0 && p.stock <= p.minStock;
    const isOut = p.stock === 0;
    const matchStock = stockFilter === 'all' || (stockFilter === 'low' && isLow) || (stockFilter === 'out' && isOut) || (stockFilter === 'ok' && !isLow && !isOut);
    return matchSearch && matchCat && matchStock;
  });

  const outCount = products.filter(p => p.stock === 0).length;
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const okCount = products.filter(p => p.stock > p.minStock).length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  const stats = [
    { label: 'Total SKUs', value: products.length.toString(), icon: Package2, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => setStockFilter('all') },
    { label: 'Healthy Stock', value: okCount.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => setStockFilter('ok') },
    { label: 'Low Stock', value: lowCount.toString(), icon: TrendingDown, color: 'text-yellow-600', bg: 'bg-yellow-50', onClick: () => setStockFilter('low') },
    { label: 'Out of Stock', value: outCount.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', onClick: () => setStockFilter('out') },
  ];

  const getStockBadge = (p: Product) => {
    if (p.stock === 0) return { cls: 'bg-red-100 text-red-700 border-red-200', label: 'Out' };
    if (p.stock <= p.minStock) return { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Low' };
    return { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'OK' };
  };

  const barPct = (p: Product) => Math.min(100, (p.stock / (p.minStock * 3 || 30)) * 100);

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor stock levels and adjust quantities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-card border border-card-border shadow-sm text-sm font-bold text-foreground">
            Stock Value: <span className="text-primary">৳{totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            onClick={s.onClick} className="bg-card border border-card-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30 active:scale-[0.98]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, SKU, brand…"
              className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-2 shadow-sm">
              <Tag className="w-4 h-4 text-primary" />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="text-sm font-semibold text-foreground outline-none bg-transparent cursor-pointer">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {(['all', 'ok', 'low', 'out'] as const).map(f => (
              <button key={f} onClick={() => setStockFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${stockFilter === f ? 'bg-primary text-white shadow-sm' : 'bg-background border border-border text-foreground hover:bg-accent'}`}>
                {f === 'all' ? 'All Stock' : f === 'ok' ? '✓ Healthy' : f === 'low' ? '⚠ Low' : '✕ Out'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Package2 className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No products match your filters</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[700px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['Product', 'SKU', 'Category', 'Stock Level', 'Qty', 'Min Stock', 'Status', 'Adjust'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const badge = getStockBadge(p as any);
                  const pct = barPct(p as any);
                  const barColor = p.stock === 0 ? 'bg-red-400' : p.stock <= p.minStock ? 'bg-yellow-400' : 'bg-emerald-400';
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                      className="border-b border-card-border/50 hover:bg-accent/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs text-primary font-semibold">{p.brand}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="font-mono text-xs bg-accent px-1.5 py-0.5 rounded text-muted-foreground">{p.sku}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${catColors[p.category] ?? 'bg-gray-100 text-gray-700'}`}>{p.category}</span></td>
                      <td className="px-4 py-3 w-32">
                        <div className="h-2 bg-accent rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-display font-bold text-lg ${p.stock === 0 ? 'text-red-600' : p.stock <= p.minStock ? 'text-yellow-600' : 'text-foreground'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-semibold">{p.minStock}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setAdjusting(p as any); setAdjQty(0); }} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl flex justify-between text-xs font-semibold text-muted-foreground">
          <span>Showing {filtered.length} of {products.length} products</span>
          <span>Total stock value: <span className="text-primary font-bold">৳{filtered.reduce((s, p) => s + p.stock * p.price, 0).toLocaleString()}</span></span>
        </div>
      </div>

      <AnimatePresence>
        {adjusting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setAdjusting(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <div>
                  <h2 className="font-display font-bold text-lg text-card-foreground">Adjust Stock</h2>
                  <p className="text-xs text-muted-foreground">{adjusting.name}</p>
                </div>
                <button onClick={() => setAdjusting(null)} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between bg-accent/50 rounded-xl p-4">
                  <span className="text-sm font-bold text-muted-foreground">Current Stock</span>
                  <span className="font-display font-bold text-2xl text-foreground">{adjusting.stock}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2">Adjustment (+ add / − remove)</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAdjQty(q => q - 1)} className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <input type="number" value={adjQty} onChange={e => setAdjQty(Number(e.target.value))}
                      className="flex-1 text-center text-xl font-display font-bold bg-background border border-border rounded-xl py-2.5 outline-none focus:border-primary transition-colors" />
                    <button type="button" onClick={() => setAdjQty(q => q + 1)} className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {adjQty !== 0 && (
                    <p className="text-center text-sm font-semibold mt-2 text-muted-foreground">
                      New stock: <span className="font-bold text-foreground">{adjusting.stock + adjQty}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Reason (optional)</label>
                  <input value={adjNote} onChange={e => setAdjNote(e.target.value)} placeholder="e.g. Stock count, damage, new delivery…"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setAdjusting(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button onClick={() => adjustMutation.mutate({ id: adjusting.id, delta: adjQty })} disabled={adjQty === 0 || adjustMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {adjustMutation.isPending ? 'Saving…' : 'Apply Adjustment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
