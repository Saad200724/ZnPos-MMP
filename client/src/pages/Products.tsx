import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Upload, Plus, Tag, AlertTriangle, Eye, Edit2,
  MoreHorizontal, Check, Package, X, AlertCircle, Trash2
} from 'lucide-react';
import { useGetProducts } from '@/lib/api';

type Product = { id: number; name: string; brand: string; sku: string; category: string; price: number; salePrice?: number; stock: number; minStock: number; active: boolean; };

const categories = ['Dry Food', 'Wet Food', 'Treats', 'Supplements', 'Accessories'];
const catColors: Record<string, string> = {
  'Dry Food': 'bg-amber-100 text-amber-700', 'Wet Food': 'bg-blue-100 text-blue-700',
  'Treats': 'bg-pink-100 text-pink-700', 'Supplements': 'bg-violet-100 text-violet-700',
  'Accessories': 'bg-teal-100 text-teal-700',
};

const blank = { name: '', brand: '', sku: '', category: 'Dry Food', price: '', salePrice: '', stock: '', minStock: '5', active: true, description: '' };

export function Products() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [filterCat, setFilterCat] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');

  const { data: products = [], isLoading } = useGetProducts();

  const save = useMutation({
    mutationFn: async (data: any) => {
      const url = editing ? `/api/products/${editing.id}` : '/api/products';
      const r = await fetch(url, { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, price: Number(data.price), salePrice: data.salePrice ? Number(data.salePrice) : undefined, stock: Number(data.stock), minStock: Number(data.minStock) }) });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed');
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
    onError: (e: any) => setErr(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const openAdd = () => { setEditing(null); setForm(blank); setErr(''); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, brand: p.brand, sku: p.sku, category: p.category, price: p.price, salePrice: p.salePrice ?? '', stock: p.stock, minStock: p.minStock, active: p.active, description: '' }); setErr(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(blank); setErr(''); };

  const filtered = products.filter(p =>
    (filterCat === 'All Categories' || p.category === filterCat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search) || p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  const outCount = products.filter(p => p.stock === 0).length;
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;

  return (
    <div className={`flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your pet product catalog
            {outCount > 0 && <span className="ml-2 text-red-500 font-bold">• {outCount} out of stock</span>}
            {lowCount > 0 && <span className="ml-2 text-yellow-600 font-bold">• {lowCount} low stock</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent text-sm font-semibold text-foreground transition-colors shadow-sm">
            <Upload className="w-4 h-4 text-primary" /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent text-sm font-semibold text-foreground transition-colors shadow-sm">
            <Download className="w-4 h-4 text-primary" /> Export
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col min-h-0 flex-1">
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-accent/30 rounded-t-2xl">
          <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-foreground outline-none w-full placeholder-muted-foreground font-medium"
              placeholder="Search name, SKU, brand…" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 shadow-sm">
              <Tag className="w-4 h-4 text-primary" />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm font-semibold text-foreground outline-none bg-transparent cursor-pointer">
                <option>All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-card rounded-b-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-accent/50 sticky top-0 z-10 border-b border-card-border">
              <tr>
                <th className="py-3 px-4 w-12 font-semibold text-muted-foreground">
                  <button onClick={toggleAll} className="flex items-center justify-center">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.length === filtered.length && filtered.length > 0 ? 'bg-primary border-primary text-white' : 'border-border bg-background'}`}>
                      {selected.length === filtered.length && filtered.length > 0 && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                </th>
                <th className="py-3 px-4 font-bold text-foreground">Product</th>
                <th className="py-3 px-4 font-bold text-foreground">Category</th>
                <th className="py-3 px-4 font-bold text-foreground text-right">Price</th>
                <th className="py-3 px-4 font-bold text-foreground text-center">Stock</th>
                <th className="py-3 px-4 font-bold text-foreground text-center">Status</th>
                <th className="py-3 px-4 font-bold text-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold">Loading products…</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">No products found</p>
                    <button onClick={openAdd} className="text-xs text-primary font-bold hover:underline">Add your first product</button>
                  </div>
                </td></tr>
              ) : filtered.map((p) => {
                const isSelected = selected.includes(p.id);
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock === 0;
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`group transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-accent/50'}`}>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelect(p.id)} className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-border bg-background group-hover:border-primary/50'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm border border-border ${catColors[p.category] ?? 'bg-accent text-primary'}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{p.name}</div>
                          <div className="flex items-center gap-2 text-xs mt-0.5">
                            <span className="text-primary font-semibold">{p.brand}</span>
                            <span className="text-muted-foreground font-mono bg-accent px-1.5 py-0.5 rounded">{p.sku}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${catColors[p.category] ?? 'bg-accent text-foreground'}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-foreground">৳{p.price.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-xs border ${isOut ? 'bg-red-50 text-red-700 border-red-200' : isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {(isLow || isOut) && <AlertTriangle className="w-3 h-3" />}
                        {p.stock}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewProduct(p as any)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(p as any)} className="p-1.5 rounded-lg hover:bg-orange-50 text-primary transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => del.mutate(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-card-border bg-accent/30 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{filtered.length}</span> of <span className="font-bold text-foreground">{products.length}</span> products
            {selected.length > 0 && <span className="ml-2 text-primary bg-primary/10 px-2 py-0.5 rounded-lg font-bold">{selected.length} selected</span>}
          </div>
          {selected.length > 0 && (
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-accent transition-colors">Export Selected</button>
              <button onClick={() => setSelected([])} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Clear Selection</button>
            </div>
          )}
        </div>
      </div>

      {/* View Product Modal */}
      <AnimatePresence>
        {viewProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewProduct(null)}>
            <motion.div initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">Product Details</h2>
                <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${catColors[viewProduct.category] ?? 'bg-accent'} shadow-sm mb-4`}>
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-center font-display font-bold text-foreground text-lg">{viewProduct.name}</h3>
                <p className="text-center text-primary font-semibold text-sm">{viewProduct.brand}</p>
                {[
                  ['SKU', viewProduct.sku], ['Category', viewProduct.category],
                  ['Price', `৳${viewProduct.price.toFixed(2)}`], ['Stock', `${viewProduct.stock} units`],
                  ['Min Stock', `${viewProduct.minStock} units`], ['Status', viewProduct.active ? 'Active' : 'Inactive'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-card-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground font-semibold">{k}</span>
                    <span className="text-sm font-bold text-foreground">{v}</span>
                  </div>
                ))}
                <button onClick={() => { setViewProduct(null); openEdit(viewProduct); }} className="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors shadow-sm">Edit Product</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={e => { e.preventDefault(); save.mutate(form); }}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Product Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Brand *</label>
                    <input required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">SKU *</label>
                    <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold font-mono outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Price (৳) *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Sale Price (৳)</label>
                    <input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Initial Stock *</label>
                    <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Min Stock Level</label>
                    <input type="number" min="0" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="col-span-2 flex items-center justify-between bg-accent/50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">Active Product</p>
                      <p className="text-xs text-muted-foreground">Show in POS and product lists</p>
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, active: !form.active })} className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.active ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={save.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {save.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
