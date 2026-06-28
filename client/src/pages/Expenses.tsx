import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, DollarSign, TrendingDown, Tag, Search, Plus, X, Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react';

interface Expense {
  id: number; title: string; category: string; amount: number; date: string;
  paymentMethod: string; reference: string | null; notes: string | null; status: string; createdAt: string;
}

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const CATEGORIES = ['General', 'Rent', 'Utilities', 'Salaries', 'Transport', 'Maintenance', 'Marketing', 'Supplies', 'Food', 'Other'];
const PAYMENTS = ['Cash', 'Card', 'bKash', 'Nagad', 'Bank Transfer', 'Cheque'];
const catColors: Record<string, string> = {
  Rent: 'bg-red-100 text-red-700', Utilities: 'bg-yellow-100 text-yellow-700',
  Salaries: 'bg-purple-100 text-purple-700', Transport: 'bg-blue-100 text-blue-700',
  Maintenance: 'bg-orange-100 text-orange-700', Marketing: 'bg-pink-100 text-pink-700',
  Supplies: 'bg-teal-100 text-teal-700', General: 'bg-gray-100 text-gray-700',
  Food: 'bg-amber-100 text-amber-700', Other: 'bg-slate-100 text-slate-700',
};
const blank = { title: '', category: 'General', amount: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'Cash', reference: '', notes: '', status: 'Paid' };

export function Expenses() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => { const r = await fetch('/api/expenses', { credentials: 'include' }); return r.json(); },
  });

  const save = useMutation({
    mutationFn: async (data: any) => {
      const url = editing ? `/api/expenses/${editing.id}` : '/api/expenses';
      const r = await fetch(url, { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, amount: Number(data.amount) }) });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed');
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); closeModal(); },
    onError: (e: any) => setErr(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/expenses/${id}`, { method: 'DELETE', credentials: 'include' }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const openAdd = () => { setEditing(null); setForm(blank); setErr(''); setModalOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); setForm({ title: e.title, category: e.category, amount: e.amount, date: e.date?.slice(0, 10) ?? '', paymentMethod: e.paymentMethod, reference: e.reference ?? '', notes: e.notes ?? '', status: e.status }); setErr(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(blank); setErr(''); };

  const now = new Date();
  const monthStr = now.toISOString().slice(0, 7);
  const monthly = expenses.filter(e => e.date?.slice(0, 7) === monthStr);
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const totalMonth = monthly.reduce((s, e) => s + e.amount, 0);

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || e.category === catFilter;
    return matchSearch && matchCat;
  });

  const stats = [
    { label: 'This Month', value: fmt(totalMonth), sub: `${monthly.length} expenses`, icon: Calendar, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total All Time', value: fmt(totalAll), sub: `${expenses.length} total`, icon: ArrowDownLeft, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Avg per Expense', value: fmt(expenses.length ? totalAll / expenses.length : 0), sub: 'Average amount', icon: TrendingDown, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Categories', value: [...new Set(expenses.map(e => e.category))].length.toString(), sub: 'Expense types', icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage business expenditures</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses…"
              className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['all', ...CATEGORIES.slice(0, 5)].map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${catFilter === cat ? 'bg-primary text-white shadow-sm' : 'bg-background border border-border text-foreground hover:bg-accent'}`}>
                {cat === 'all' ? 'All' : cat}
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
              <DollarSign className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No expenses found</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[600px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['Title', 'Category', 'Date', 'Payment', 'Amount', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => (
                  <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 15) * 0.02 }}
                    className="border-b border-card-border/50 hover:bg-accent/30 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{exp.title}</p>
                      {exp.reference && <p className="text-xs text-muted-foreground">Ref: {exp.reference}</p>}
                    </td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${catColors[exp.category] ?? 'bg-gray-100 text-gray-700'}`}>{exp.category}</span></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{fmtDate(exp.date)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{exp.paymentMethod}</td>
                    <td className="px-4 py-3 font-display font-bold text-red-600">{fmt(exp.amount)}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${exp.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{exp.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(exp)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del.mutate(exp.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>{filtered.length} of {expenses.length} expenses</span>
          <span className="text-red-600 font-bold">{fmt(filtered.reduce((s, e) => s + e.amount, 0))} total</span>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={e => { e.preventDefault(); save.mutate(form); }}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Expense Title *</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  {[['Category', 'category', CATEGORIES], ['Payment Method', 'paymentMethod', PAYMENTS], ['Status', 'status', ['Paid', 'Pending', 'Cancelled']]].map(([label, key, opts]) => (
                    <div key={key as string}>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                      <select value={form[key as string]} onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                        {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Amount (৳) *</label>
                    <input required type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Reference / Notes</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={save.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {save.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Expense'}
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
