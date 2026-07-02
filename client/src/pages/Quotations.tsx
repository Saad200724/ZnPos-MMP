import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@/lib/api/custom-fetch';
import { useGetCustomers, useGetProducts } from '@/lib/api';
import {
  FileText, Plus, Search, X, Clock, CheckCircle, XCircle,
  Send, Eye, AlertCircle, DollarSign, Trash2
} from 'lucide-react';

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

interface QItem { productId?: number | null; productName: string; sku: string; price: number; qty: number; lineTotal: number; }
interface Quotation {
  id: number; quotationNo: string; customerId?: number | null; customerName: string;
  items: QItem[]; subtotal: number; discountAmt: number; tax: number; total: number;
  validUntil?: string | null; status: string; notes?: string | null; createdAt: string;
}

const statusCfg: Record<string, { label: string; cls: string; icon: any }> = {
  Draft:    { label: 'Draft',    cls: 'bg-gray-100 text-gray-600 border-gray-200',         icon: Clock },
  Sent:     { label: 'Sent',     cls: 'bg-blue-100 text-blue-700 border-blue-200',          icon: Send },
  Accepted: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  Rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200',             icon: XCircle },
};

const blankItem = (): QItem => ({ productId: null, productName: '', sku: '', price: 0, qty: 1, lineTotal: 0 });

export function Quotations() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Quotation | null>(null);
  const [items, setItems] = useState<QItem[]>([blankItem()]);
  const [form, setForm] = useState({
    customerName: '', customerId: '' as string | number,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    notes: '',
  });

  const { data: quotations = [], isLoading } = useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: () => customFetch<Quotation[]>('/api/quotations'),
  });

  const { data: customers = [] } = useGetCustomers();
  const { data: products = [] } = useGetProducts();

  const create = useMutation({
    mutationFn: (data: any) => customFetch<Quotation>('/api/quotations', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotations'] }); closeModal(); },
    onError: (e: any) => setErr(e?.data?.error ?? e.message ?? 'Failed to create'),
  });

  const patch = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      customFetch<Quotation>(`/api/quotations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      setSelected(updated);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => customFetch<void>(`/api/quotations/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotations'] }); setConfirmDelete(null); setSelected(null); },
  });

  const openModal = () => {
    setItems([blankItem()]);
    setForm({ customerName: '', customerId: '', validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), notes: '' });
    setErr('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setErr(''); };

  const updateItem = (i: number, key: string, val: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [key]: val };
      updated.lineTotal = Number(updated.qty) * Number(updated.price);
      return updated;
    }));
  };

  const selectProduct = (i: number, productId: string) => {
    const p = products.find(p => String(p.id) === productId);
    if (!p) return;
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const price = Number(p.price ?? 0);
      const qty = Number(item.qty) || 1;
      return { ...item, productId: Number(productId), productName: p.name, sku: (p as any).sku ?? '', price, qty, lineTotal: price * qty };
    }));
  };

  const subtotal = items.reduce((s, it) => s + Number(it.lineTotal), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName) { setErr('Please select a customer'); return; }
    const payload = {
      customerId: form.customerId ? Number(form.customerId) : null,
      customerName: form.customerName,
      items: items.map(it => ({ ...it, productId: it.productId ?? null, price: Number(it.price), qty: Number(it.qty), lineTotal: Number(it.lineTotal) })),
      subtotal, discountAmt: 0, tax: 0, total: subtotal,
      validUntil: form.validUntil || null,
      notes: form.notes || null,
      status: 'Draft',
    };
    create.mutate(payload);
  };

  const filtered = quotations.filter(q =>
    q.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
    q.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Quotes', value: quotations.length.toString(),                                     icon: FileText,     color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Sent',         value: quotations.filter(q => q.status === 'Sent').length.toString(),     icon: Send,         color: 'text-violet-600',  bg: 'bg-violet-50' },
    { label: 'Accepted',     value: quotations.filter(q => q.status === 'Accepted').length.toString(), icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Quote Value',  value: fmt(quotations.reduce((s, q) => s + q.total, 0)),                  icon: DollarSign,   color: 'text-primary',     bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Quotations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage price quotes for customers</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0 min-w-0">
          <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl">
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quote number or customer…"
                className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Loading quotations…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <FileText className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No quotations yet</p>
                <button onClick={openModal} className="text-xs text-primary font-bold hover:underline">Create your first quotation</button>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[540px]">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-card-border">
                    {['Quote #', 'Customer', 'Items', 'Total', 'Valid Until', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q, i) => {
                    const sc = statusCfg[q.status] ?? statusCfg.Draft;
                    const SIcon = sc.icon;
                    const expired = q.validUntil && new Date(q.validUntil) < new Date();
                    return (
                      <motion.tr key={q.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                        onClick={() => setSelected(selected?.id === q.id ? null : q)}
                        className={`border-b border-card-border/50 cursor-pointer transition-colors group ${selected?.id === q.id ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
                        <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{q.quotationNo}</span></td>
                        <td className="px-4 py-3 font-semibold text-foreground">{q.customerName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{q.items.length} item{q.items.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 font-display font-bold text-foreground">{fmt(q.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${expired ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {q.validUntil ? fmtDate(q.validUntil) : '—'}{expired ? ' (Exp)' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                            <SIcon className="w-3 h-3" />{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); setSelected(q); }} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={e => { e.stopPropagation(); setConfirmDelete(q); }} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl text-xs font-semibold text-muted-foreground">
            {filtered.length} of {quotations.length} quotations
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, width: 0, x: 20 }} animate={{ opacity: 1, width: 304, x: 0 }} exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-card-border bg-accent/20">
                <div>
                  <h3 className="font-display font-bold text-foreground">{selected.quotationNo}</h3>
                  <p className="text-xs text-muted-foreground">{selected.customerName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="bg-accent/40 rounded-xl p-3 space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.qty} × {fmt(item.price)}</p>
                      </div>
                      <p className="text-sm font-bold whitespace-nowrap">{fmt(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
                {selected.notes && (
                  <div><p className="text-xs font-bold text-muted-foreground mb-1">Notes</p><p className="text-sm text-muted-foreground">{selected.notes}</p></div>
                )}
                {selected.validUntil && (
                  <div className="text-xs text-muted-foreground">Valid until: <span className="font-semibold">{fmtDate(selected.validUntil)}</span></div>
                )}
                <div className="flex justify-between items-center font-display font-bold text-xl border-t border-card-border pt-3">
                  <span>Total</span><span className="text-primary">{fmt(selected.total)}</span>
                </div>
                <div className="space-y-2">
                  {selected.status !== 'Sent' && (
                    <button onClick={() => patch.mutate({ id: selected.id, data: { status: 'Sent' } })} disabled={patch.isPending}
                      className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      <Send className="w-4 h-4" />{patch.isPending ? 'Updating…' : 'Mark as Sent'}
                    </button>
                  )}
                  {selected.status !== 'Accepted' && (
                    <button onClick={() => patch.mutate({ id: selected.id, data: { status: 'Accepted' } })} disabled={patch.isPending}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors disabled:opacity-60">
                      {patch.isPending ? 'Updating…' : 'Mark Accepted'}
                    </button>
                  )}
                  {selected.status !== 'Rejected' && (
                    <button onClick={() => patch.mutate({ id: selected.id, data: { status: 'Rejected' } })} disabled={patch.isPending}
                      className="w-full py-2.5 rounded-xl bg-background border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-60">
                      {patch.isPending ? 'Updating…' : 'Mark Rejected'}
                    </button>
                  )}
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
                <h2 className="font-display font-bold text-lg text-card-foreground">New Quotation</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Customer *</label>
                    <select required value={form.customerId} onChange={e => {
                      const cust = customers.find(c => String(c.id) === e.target.value);
                      setForm(f => ({ ...f, customerId: e.target.value, customerName: cust?.name ?? '' }));
                    }}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      <option value="">Select customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Valid Until</label>
                    <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-muted-foreground">Items *</label>
                    <button type="button" onClick={() => setItems(p => [...p, blankItem()])} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" />Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-1.5 items-center">
                        <select value={item.productId ?? ''} onChange={e => selectProduct(i, e.target.value)}
                          className="flex-1 bg-background border border-border rounded-xl px-2.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors">
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} placeholder="Qty"
                          className="w-14 bg-background border border-border rounded-xl px-2 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(i, 'price', Number(e.target.value))} placeholder="Price"
                          className="w-20 bg-background border border-border rounded-xl px-2 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        {items.length > 1 && (
                          <button type="button" onClick={() => setItems(p => p.filter((_, idx) => idx !== i))} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center font-display font-bold text-lg border-t border-card-border pt-3">
                  <span className="text-muted-foreground text-sm">Total</span>
                  <span className="text-primary">{fmt(subtotal)}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {create.isPending ? 'Creating…' : 'Create Quotation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-foreground mb-2">Delete Quotation?</h3>
              <p className="text-sm text-muted-foreground mb-6">This will permanently delete <strong>{confirmDelete.quotationNo}</strong>.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-accent transition-colors">Cancel</button>
                <button disabled={remove.isPending} onClick={() => remove.mutate(confirmDelete.id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60">
                  {remove.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
