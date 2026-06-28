import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, X, Clock, CheckCircle, XCircle,
  Send, Eye, Copy, AlertCircle, DollarSign, Hash, Users
} from 'lucide-react';
import { useGetCustomers, useGetProducts } from '@/lib/api';

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

interface QuoteItem { productName: string; qty: number; price: number; discount: number; }
interface Quote {
  id: number; quoteNo: string; customerName: string; items: QuoteItem[];
  total: number; status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string; notes: string; createdAt: string;
}

const statusCfg = {
  draft:    { label: 'Draft',    cls: 'bg-gray-100 text-gray-600 border-gray-200',    icon: Clock },
  sent:     { label: 'Sent',     cls: 'bg-blue-100 text-blue-700 border-blue-200',    icon: Send },
  accepted: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200',       icon: XCircle },
};

const mockQuotes: Quote[] = [
  { id: 1, quoteNo: 'QT-0001', customerName: 'Rashida Begum', items: [{ productName: 'Royal Canin Kitten', qty: 3, price: 1200, discount: 5 }, { productName: 'Cat Treats Pack', qty: 2, price: 350, discount: 0 }], total: 4120, status: 'sent', validUntil: new Date(Date.now() + 7 * 86400000).toISOString(), notes: 'Bulk order discount applied.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 2, quoteNo: 'QT-0002', customerName: 'Kamal Hossain', items: [{ productName: 'Dog Collar Premium', qty: 1, price: 800, discount: 0 }], total: 800, status: 'draft', validUntil: new Date(Date.now() + 14 * 86400000).toISOString(), notes: '', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, quoteNo: 'QT-0003', customerName: 'Fatima Khanam', items: [{ productName: 'Fish Food Variety', qty: 5, price: 220, discount: 10 }], total: 990, status: 'accepted', validUntil: new Date(Date.now() + 3 * 86400000).toISOString(), notes: '', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const blankItem = { productName: '', qty: 1, price: 0, discount: 0 };

export function Quotations() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Quote | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState([{ ...blankItem }]);
  const [form, setForm] = useState({ customerName: '', validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), notes: '' });

  const { data: customers = [] } = useGetCustomers();
  const { data: products = [] } = useGetProducts();

  const filtered = quotes.filter(q =>
    q.quoteNo.toLowerCase().includes(search.toLowerCase()) ||
    q.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const total = items.reduce((s, it) => s + (Number(it.qty) * Number(it.price) * (1 - Number(it.discount) / 100)), 0);

  const addItem = () => setItems(prev => [...prev, { ...blankItem }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: string, val: any) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = quotes.length + 1;
    setQuotes(prev => [...prev, {
      id, quoteNo: `QT-${String(id).padStart(4, '0')}`, ...form, items, total,
      status: 'draft', createdAt: new Date().toISOString(),
    }]);
    setModalOpen(false);
    setItems([{ ...blankItem }]);
    setForm({ customerName: '', validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), notes: '' });
  };

  const stats = [
    { label: 'Total Quotes', value: quotes.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sent', value: quotes.filter(q => q.status === 'sent').length.toString(), icon: Send, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Quote Value', value: fmt(quotes.reduce((s, q) => s + q.total, 0)), icon: DollarSign, color: 'text-primary', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Quotations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage price quotes for customers</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
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
                  const sc = statusCfg[q.status];
                  const SIcon = sc.icon;
                  const expired = new Date(q.validUntil) < new Date();
                  return (
                    <motion.tr key={q.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(selected?.id === q.id ? null : q)}
                      className={`border-b border-card-border/50 cursor-pointer transition-colors group ${selected?.id === q.id ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
                      <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{q.quoteNo}</span></td>
                      <td className="px-4 py-3 font-semibold text-foreground">{q.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{q.items.length} item{q.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 font-display font-bold text-foreground">{fmt(q.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${expired ? 'text-red-500' : 'text-muted-foreground'}`}>{fmtDate(q.validUntil)}{expired ? ' (Exp)' : ''}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                          <SIcon className="w-3 h-3" />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, width: 0, x: 20 }} animate={{ opacity: 1, width: 288, x: 0 }} exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-card-border bg-accent/20">
                <div><h3 className="font-display font-bold text-foreground">{selected.quoteNo}</h3>
                  <p className="text-xs text-muted-foreground">{selected.customerName}</p></div>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="bg-accent/40 rounded-xl p-3 space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <div><p className="text-sm font-bold text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.qty} × {fmt(item.price)}{item.discount > 0 ? ` (${item.discount}% off)` : ''}</p></div>
                      <p className="text-sm font-bold whitespace-nowrap">{fmt(item.qty * item.price * (1 - item.discount / 100))}</p>
                    </div>
                  ))}
                </div>
                {selected.notes && <div><p className="text-xs font-bold text-muted-foreground mb-1">Notes</p><p className="text-sm text-muted-foreground">{selected.notes}</p></div>}
                <div className="flex justify-between items-center font-display font-bold text-xl border-t border-card-border pt-3">
                  <span>Total</span><span className="text-primary">{fmt(selected.total)}</span>
                </div>
                <div className="space-y-2">
                  <button onClick={() => { setQuotes(prev => prev.map(q => q.id === selected.id ? { ...q, status: 'sent' } : q)); setSelected(q => q ? { ...q, status: 'sent' as const } : q); }} className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"><Send className="w-4 h-4" />Send to Customer</button>
                  <button onClick={() => { setQuotes(prev => prev.map(q => q.id === selected.id ? { ...q, status: 'accepted' } : q)); setSelected(q => q ? { ...q, status: 'accepted' as const } : q); }} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">Mark Accepted</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">New Quotation</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Customer</label>
                    <select required value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      <option value="">Select customer</option>
                      {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                    <button type="button" onClick={addItem} className="text-xs text-primary font-bold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add Row</button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-1.5 items-center">
                        <input required value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} placeholder="Product"
                          className="flex-1 bg-background border border-border rounded-xl px-2.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="Qty"
                          className="w-14 bg-background border border-border rounded-xl px-2.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} placeholder="Price"
                          className="w-20 bg-background border border-border rounded-xl px-2.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                        <input type="number" min="0" max="100" value={item.discount} onChange={e => updateItem(i, 'discount', e.target.value)} placeholder="Disc%"
                          className="w-16 bg-background border border-border rounded-xl px-2.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-colors" />
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
                  <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Create Quote</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
