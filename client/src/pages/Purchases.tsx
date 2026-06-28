import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Package, Truck, DollarSign, Plus, Search, X, Eye,
  Clock, CheckCircle, AlertCircle, XCircle, Calendar, ChevronDown
} from 'lucide-react';

interface PurchaseItem { productId: number | null; productName: string; qty: number; cost: number; lineTotal: number; }
interface Purchase {
  id: number; poNumber: string; supplierId: number | null; supplierName: string;
  total: number; status: string; notes: string | null; items: PurchaseItem[]; createdAt: string;
}
interface Supplier { id: number; name: string; }

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const statusCfg: Record<string, { label: string; icon: any; cls: string }> = {
  pending:  { label: 'Pending',  icon: Clock,         cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  received: { label: 'Received', icon: CheckCircle,   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  partial:  { label: 'Partial',  icon: Package,       cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  cancelled:{ label: 'Cancelled',icon: XCircle,       cls: 'bg-red-100 text-red-700 border-red-200' },
};

const blankItem = { productName: '', qty: 1, cost: 0 };

export function Purchases() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState([{ ...blankItem }]);
  const [form, setForm] = useState({ supplierName: '', status: 'pending', notes: '' });
  const [err, setErr] = useState('');

  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ['purchases'],
    queryFn: async () => { const r = await fetch('/api/purchases', { credentials: 'include' }); return r.json(); },
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => { const r = await fetch('/api/suppliers', { credentials: 'include' }); return r.json(); },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch('/api/purchases', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed');
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); closeModal(); },
    onError: (e: any) => setErr(e.message),
  });

  const closeModal = () => { setModalOpen(false); setItems([{ ...blankItem }]); setForm({ supplierName: '', status: 'pending', notes: '' }); setErr(''); };
  const addItem = () => setItems(prev => [...prev, { ...blankItem }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: string, val: any) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const total = items.reduce((s, it) => s + (Number(it.qty) * Number(it.cost)), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mappedItems = items.map(it => ({ productName: it.productName, qty: Number(it.qty), cost: Number(it.cost), lineTotal: Number(it.qty) * Number(it.cost) }));
    create.mutate({ ...form, items: mappedItems, total });
  };

  const filtered = purchases.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayPurchases = purchases.filter(p => p.createdAt.slice(0, 10) === today);

  const stats = [
    { label: 'Total Orders', value: purchases.length.toString(), icon: Receipt, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: "Today's Orders", value: todayPurchases.length.toString(), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: purchases.filter(p => p.status === 'pending').length.toString(), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Spent', value: fmt(purchases.reduce((s, p) => s + p.total, 0)), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const statusOpts = [
    { label: 'All', value: 'all' }, { label: 'Pending', value: 'pending' },
    { label: 'Received', value: 'received' }, { label: 'Partial', value: 'partial' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Purchases</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track purchase orders and incoming inventory</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-card border border-card-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0 min-w-0">
          <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PO number or supplier…"
                className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {statusOpts.map(opt => (
                <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === opt.value ? 'bg-primary text-white shadow-sm' : 'bg-background border border-border text-foreground hover:bg-accent'}`}>
                  {opt.label}
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
                <Receipt className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No purchase orders found</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[600px]">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-card-border">
                    {['PO Number', 'Supplier', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((po, i) => {
                    const sc = statusCfg[po.status] ?? statusCfg['pending'];
                    const SIcon = sc.icon;
                    return (
                      <motion.tr key={po.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                        onClick={() => setSelected(selected?.id === po.id ? null : po)}
                        className={`border-b border-card-border/50 cursor-pointer transition-colors group ${selected?.id === po.id ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{po.poNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold text-foreground">{po.supplierName || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{po.items.length} item{po.items.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 font-display font-bold text-foreground">{fmt(po.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                            <SIcon className="w-3 h-3" />{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(po.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                            <Eye className="w-4 h-4" />
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
            <span>{filtered.length} of {purchases.length} orders</span>
            <span className="text-primary font-bold">{fmt(filtered.reduce((s, p) => s + p.total, 0))} total</span>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, width: 0, x: 20 }} animate={{ opacity: 1, width: 300, x: 0 }} exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-card-border bg-accent/20">
                <div>
                  <h3 className="font-display font-bold text-foreground">PO Details</h3>
                  <p className="text-xs font-mono text-primary">{selected.poNumber}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span className="font-semibold">{selected.supplierName || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold">{fmtDate(selected.createdAt)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Status</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${statusCfg[selected.status]?.cls}`}>
                      {statusCfg[selected.status]?.label}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Items</h4>
                  <div className="bg-accent/40 rounded-xl p-3 space-y-2">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-2">
                        <div><p className="text-sm font-bold text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.qty} × {fmt(item.cost)}</p></div>
                        <p className="text-sm font-bold whitespace-nowrap">{fmt(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {selected.notes && (
                  <div><h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selected.notes}</p></div>
                )}
                <div className="flex justify-between items-center font-display font-bold text-xl border-t border-card-border pt-3">
                  <span>Total</span><span className="text-primary">{fmt(selected.total)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">New Purchase Order</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Supplier</label>
                    <select value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      <option value="">Select supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-muted-foreground">Items *</label>
                    <button type="button" onClick={addItem} className="text-xs text-primary font-bold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add Row</button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input required value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} placeholder="Product name"
                          className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        <input required type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="Qty"
                          className="w-16 bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        <input required type="number" min="0" step="0.01" value={item.cost} onChange={e => updateItem(i, 'cost', e.target.value)} placeholder="Cost"
                          className="w-24 bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center font-display font-bold text-lg border-t border-card-border pt-3">
                  <span className="text-muted-foreground text-sm">Total</span><span className="text-primary">{fmt(total)}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {create.isPending ? 'Creating…' : 'Create PO'}
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
