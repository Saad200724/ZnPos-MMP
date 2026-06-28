import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, DollarSign, TrendingDown, Wrench, Search, Plus, X, Edit2, MapPin, Hash, AlertCircle } from 'lucide-react';

interface Asset {
  id: number; name: string; category: string; purchaseDate: string;
  purchasePrice: number; currentValue: number; depreciationRate: number;
  location: string | null; serialNo: string | null; condition: string;
  notes: string | null; status: string; createdAt: string;
}

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CATEGORIES = ['Equipment', 'Furniture', 'Vehicle', 'IT Hardware', 'Building', 'Tools', 'Other'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Under Repair'];
const condColors: Record<string, string> = {
  Excellent: 'bg-emerald-100 text-emerald-700', Good: 'bg-green-100 text-green-700',
  Fair: 'bg-yellow-100 text-yellow-700', Poor: 'bg-red-100 text-red-700',
  'Under Repair': 'bg-orange-100 text-orange-700',
};
const blank = { name: '', category: 'Equipment', purchaseDate: new Date().toISOString().slice(0, 10), purchasePrice: '', currentValue: '', depreciationRate: 0, location: '', serialNo: '', condition: 'Good', notes: '', status: 'Active' };

export function Assets() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => { const r = await fetch('/api/assets', { credentials: 'include' }); return r.json(); },
  });

  const save = useMutation({
    mutationFn: async (data: any) => {
      const url = editing ? `/api/assets/${editing.id}` : '/api/assets';
      const r = await fetch(url, { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, purchasePrice: Number(data.purchasePrice), currentValue: Number(data.currentValue), depreciationRate: Number(data.depreciationRate) }) });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed');
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); closeModal(); },
    onError: (e: any) => setErr(e.message),
  });

  const dispose = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/assets/${id}`, { method: 'DELETE', credentials: 'include' }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });

  const openAdd = () => { setEditing(null); setForm(blank); setErr(''); setModalOpen(true); };
  const openEdit = (a: Asset) => { setEditing(a); setForm({ name: a.name, category: a.category, purchaseDate: a.purchaseDate?.slice(0, 10) ?? '', purchasePrice: a.purchasePrice, currentValue: a.currentValue, depreciationRate: a.depreciationRate, location: a.location ?? '', serialNo: a.serialNo ?? '', condition: a.condition, notes: a.notes ?? '', status: a.status }); setErr(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(blank); setErr(''); };

  const active = assets.filter(a => a.status === 'Active');
  const totalPurchase = active.reduce((s, a) => s + a.purchasePrice, 0);
  const totalCurrent = active.reduce((s, a) => s + a.currentValue, 0);
  const depreciation = totalPurchase - totalCurrent;

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()) || (a.serialNo ?? '').toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: 'Total Assets', value: assets.length.toString(), sub: `${active.length} active`, icon: Boxes, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Purchase Value', value: fmt(totalPurchase), sub: 'Original cost', icon: DollarSign, color: 'text-primary', bg: 'bg-green-50' },
    { label: 'Current Value', value: fmt(totalCurrent), sub: 'Book value', icon: TrendingDown, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Depreciation', value: fmt(depreciation), sub: 'Value lost', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track business assets and their value over time</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Asset
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
        <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, category, serial no…"
              className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Boxes className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No assets found</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[700px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['Asset', 'Category', 'Serial No', 'Location', 'Purchase Value', 'Current Value', 'Condition', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 15) * 0.02 }}
                    className="border-b border-card-border/50 hover:bg-accent/30 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(a.purchaseDate)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{a.category}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Hash className="w-3 h-3" />{a.serialNo ?? '—'}</span></td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{a.location ?? '—'}</span></td>
                    <td className="px-4 py-3 font-semibold text-foreground">{fmt(a.purchasePrice)}</td>
                    <td className="px-4 py-3 font-display font-bold text-primary">{fmt(a.currentValue)}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${condColors[a.condition] ?? 'bg-gray-100 text-gray-700'}`}>{a.condition}</span></td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        {a.status === 'Active' && <button onClick={() => dispose.mutate(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">{editing ? 'Edit Asset' : 'Add Asset'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={e => { e.preventDefault(); save.mutate(form); }}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Asset Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  {[['Category', 'category', CATEGORIES], ['Condition', 'condition', CONDITIONS], ['Status', 'status', ['Active', 'Disposed', 'Under Repair']]].map(([label, key, opts]) => (
                    <div key={key as string}>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                      <select value={form[key as string]} onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                        {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  {[['Purchase Price (৳) *', 'purchasePrice', 'number'], ['Current Value (৳) *', 'currentValue', 'number'], ['Depreciation Rate (%)', 'depreciationRate', 'number'], ['Serial No', 'serialNo', 'text'], ['Location', 'location', 'text']].map(([label, key, type]) => (
                    <div key={key as string}>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                      <input type={type} required={(label as string).endsWith('*')} value={form[key as string]} onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Purchase Date</label>
                    <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Notes</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={save.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {save.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Asset'}
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
