import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, TrendingUp, DollarSign, Hash, Search, X,
  Eye, Calendar, Banknote, CreditCard, Smartphone, Receipt
} from 'lucide-react';

interface TxItem { productName: string; productBrand: string; sku: string; price: number; qty: number; lineTotal: number; }
interface Tx {
  id: number; receiptNo: string; customerName: string; total: number; subtotal: number;
  discountAmt: number; tax: number; paymentMethod: string; status: string;
  notes: string | null; createdAt: string; items: TxItem[];
}

const paymentIcon: Record<string, any> = { cash: Banknote, card: CreditCard, bkash: Smartphone, nagad: Smartphone, credit: DollarSign };
const paymentColors: Record<string, string> = {
  cash: 'bg-emerald-100 text-emerald-700', card: 'bg-blue-100 text-blue-700',
  bkash: 'bg-pink-100 text-pink-700', nagad: 'bg-orange-100 text-orange-700',
  credit: 'bg-purple-100 text-purple-700',
};
const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export function Sales() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Tx | null>(null);

  const { data: transactions = [], isLoading } = useQuery<Tx[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const r = await fetch('/api/transactions', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayTx = transactions.filter(t => t.createdAt.slice(0, 10) === today);
  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);
  const todayRevenue = todayTx.reduce((s, t) => s + t.total, 0);
  const avgOrder = transactions.length ? totalRevenue / transactions.length : 0;

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.receiptNo.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || t.paymentMethod === filter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "Today's Revenue", value: fmt(todayRevenue), sub: `${todayTx.length} orders today`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: fmt(totalRevenue), sub: 'All time', icon: DollarSign, color: 'text-primary', bg: 'bg-green-50' },
    { label: 'Avg Order Value', value: fmt(avgOrder), sub: 'Per transaction', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: transactions.length.toLocaleString(), sub: 'All time', icon: Hash, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const filterOpts = [
    { label: 'All', value: 'all' }, { label: 'Cash', value: 'cash' }, { label: 'Card', value: 'card' },
    { label: 'bKash', value: 'bkash' }, { label: 'Nagad', value: 'nagad' }, { label: 'Credit', value: 'credit' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All POS transactions and revenue history</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-card border border-card-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-3 bg-accent/20 rounded-t-2xl">
          <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground outline-none w-full placeholder-muted-foreground"
              placeholder="Search receipt or customer…" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filterOpts.map(opt => (
              <button key={opt.value} onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === opt.value ? 'bg-primary text-white shadow-sm' : 'bg-background border border-border text-foreground hover:bg-accent'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Loading sales…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Receipt className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No transactions found</p>
              <p className="text-xs text-muted-foreground/60">Try adjusting your search or filter</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="border-b border-card-border">
                  {['Receipt', 'Customer', 'Items', 'Payment', 'Total', 'Date & Time', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => {
                  const PIcon = paymentIcon[tx.paymentMethod] ?? DollarSign;
                  return (
                    <motion.tr key={tx.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                      className="border-b border-card-border/50 hover:bg-accent/40 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{tx.receiptNo}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground max-w-[160px] truncate">{tx.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tx.items.length} item{tx.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${paymentColors[tx.paymentMethod] ?? 'bg-gray-100 text-gray-700'}`}>
                          <PIcon className="w-3 h-3" />{tx.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-foreground">{fmt(tx.total)}</td>
                      <td className="px-4 py-3">
                        <div className="text-foreground font-semibold text-xs">{fmtDate(tx.createdAt)}</div>
                        <div className="text-muted-foreground/60 text-xs">{fmtTime(tx.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(tx)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
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
        <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>{filtered.length} of {transactions.length} transactions</span>
          <span className="text-primary font-bold">{fmt(filtered.reduce((s, t) => s + t.total, 0))} total</span>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <div>
                  <h2 className="font-display font-bold text-lg text-card-foreground">Sale Receipt</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{selected.receiptNo}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Customer</span><span className="font-bold text-foreground">{selected.customerName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date & Time</span><span className="font-semibold">{fmtDate(selected.createdAt)} {fmtTime(selected.createdAt)}</span></div>
                <div className="flex justify-between text-sm items-center"><span className="text-muted-foreground">Payment</span>
                  <span className={`font-bold capitalize px-2 py-0.5 rounded-full text-xs ${paymentColors[selected.paymentMethod] ?? ''}`}>{selected.paymentMethod}</span>
                </div>
              </div>
              <div className="px-5 pb-4">
                <div className="bg-accent/40 rounded-xl p-3 space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <div><p className="text-sm font-bold text-foreground leading-tight">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.qty} × {fmt(item.price)}</p></div>
                      <p className="text-sm font-bold text-foreground whitespace-nowrap">{fmt(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 pb-5 space-y-1.5 border-t border-card-border pt-4">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{fmt(selected.subtotal)}</span></div>
                {selected.discountAmt > 0 && <div className="flex justify-between text-sm text-red-500 font-semibold"><span>Discount</span><span>–{fmt(selected.discountAmt)}</span></div>}
                {selected.tax > 0 && <div className="flex justify-between text-sm text-muted-foreground"><span>Tax</span><span>{fmt(selected.tax)}</span></div>}
                <div className="flex justify-between font-display font-bold text-xl text-card-foreground pt-3 border-t border-card-border mt-2">
                  <span>Total</span><span className="text-primary">{fmt(selected.total)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
