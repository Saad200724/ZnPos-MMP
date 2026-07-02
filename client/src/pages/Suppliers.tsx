import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Phone, Mail, MapPin, Plus, Search, X, Edit2, AlertCircle, DollarSign, TrendingUp, Trash2
} from 'lucide-react';
import {
  useGetSuppliers, useCreateSupplier, useUpdateSupplier,
  getGetSuppliersQueryKey,
} from '@/lib/api';
import { customFetch } from '@/lib/api/custom-fetch';
import { useMutation } from '@tanstack/react-query';

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
const avatarColors = ['bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500'];
const blank = { name: '', phone: '', email: '', address: '' };

export function Suppliers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const { data: suppliers = [], isLoading } = useGetSuppliers();

  const create = useCreateSupplier({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSuppliersQueryKey() }); closeModal(); },
      onError: (e: any) => setErr(e?.data?.error ?? e.message ?? 'Failed'),
    },
  });

  const update = useUpdateSupplier({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSuppliersQueryKey() }); closeModal(); },
      onError: (e: any) => setErr(e?.data?.error ?? e.message ?? 'Failed'),
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => customFetch<void>(`/api/suppliers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetSuppliersQueryKey() });
      setConfirmDelete(null);
      setSelected(null);
    },
  });

  const openAdd = () => { setEditing(null); setForm(blank); setErr(''); setModalOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '' });
    setErr('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(blank); setErr(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, phone: form.phone || null, email: form.email || null, address: form.address || null };
    if (editing) update.mutate({ id: editing.id, data });
    else create.mutate({ data });
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search)) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalDue = suppliers.reduce((s, sup) => s + (sup.balance < 0 ? Math.abs(sup.balance) : 0), 0);
  const totalPaid = suppliers.reduce((s, sup) => s + (sup.balance > 0 ? sup.balance : 0), 0);

  const stats = [
    { label: 'Total Suppliers',  value: suppliers.length.toString(),                         icon: Truck,        color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'With Due Balance', value: suppliers.filter(s => s.balance < 0).length.toString(), icon: AlertCircle, color: 'text-red-600',    bg: 'bg-red-50' },
    { label: 'Total Payable',    value: fmt(totalDue),                                         icon: DollarSign,  color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Paid',       value: fmt(totalPaid),                                        icon: TrendingUp,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const isPending = create.isPending || update.isPending;

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage vendor relationships and balances</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Supplier
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
          <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl">
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier name, email, phone…"
                className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Loading suppliers…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Truck className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No suppliers found</p>
                <button onClick={openAdd} className="text-xs text-primary font-bold hover:underline">Add your first supplier</button>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[540px]">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-card-border">
                    {['Supplier', 'Contact', 'Address', 'Balance', 'Since', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sup, i) => {
                    const initials = sup.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                    const ac = avatarColors[sup.id % avatarColors.length];
                    return (
                      <motion.tr key={sup.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                        onClick={() => setSelected(selected?.id === sup.id ? null : sup)}
                        className={`border-b border-card-border/50 cursor-pointer transition-colors group ${selected?.id === sup.id ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${ac}`}>{initials}</div>
                            <span className={`font-bold transition-colors ${selected?.id === sup.id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{sup.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {sup.phone && <div className="flex items-center gap-1.5 text-xs text-foreground font-medium"><Phone className="w-3 h-3 text-muted-foreground" />{sup.phone}</div>}
                            {sup.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{sup.email}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                          {sup.address ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{sup.address}</span> : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-display font-bold text-sm ${sup.balance < 0 ? 'text-red-600' : sup.balance > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {sup.balance < 0 ? `–${fmt(Math.abs(sup.balance))}` : fmt(sup.balance)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(sup.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); openEdit(sup); }} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={e => { e.stopPropagation(); setConfirmDelete(sup); }} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl flex justify-between text-xs font-semibold text-muted-foreground">
            <span>{filtered.length} of {suppliers.length} suppliers</span>
            <span className={`font-bold ${totalDue > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>Due: {fmt(totalDue)}</span>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, width: 0, x: 20 }} animate={{ opacity: 1, width: 288, x: 0 }} exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-b border-card-border relative text-center">
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/70 border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white shadow-md mb-3 ${avatarColors[selected.id % avatarColors.length]}`}>
                  {selected.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-lg font-display font-bold text-foreground mb-0.5">{selected.name}</h2>
                <span className="text-xs text-muted-foreground font-semibold">Supplier #{selected.id}</span>
              </div>
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Details</h3>
                  {selected.phone && <div className="flex items-center gap-2.5 text-sm font-medium text-foreground"><Phone className="w-4 h-4 text-primary" />{selected.phone}</div>}
                  {selected.email && <div className="flex items-center gap-2.5 text-sm font-medium text-foreground"><Mail className="w-4 h-4 text-primary" />{selected.email}</div>}
                  {selected.address && <div className="flex items-start gap-2.5 text-sm font-medium text-foreground"><MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{selected.address}</div>}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Balance</h3>
                  <div className={`rounded-xl p-4 border ${selected.balance < 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className={`text-2xl font-display font-bold ${selected.balance < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      {selected.balance < 0 ? `–${fmt(Math.abs(selected.balance))}` : fmt(selected.balance)}
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${selected.balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selected.balance < 0 ? 'Amount Payable' : selected.balance > 0 ? 'Amount Receivable' : 'Settled'}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <button onClick={() => openEdit(selected)} className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors shadow-sm">Edit Supplier</button>
                  <button onClick={() => setConfirmDelete(selected)} className="w-full py-2.5 rounded-xl bg-background border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors shadow-sm">Delete Supplier</button>
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
              className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <h2 className="font-display font-bold text-lg text-card-foreground">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                {([['Supplier Name *', 'name', 'text'], ['Phone', 'phone', 'tel'], ['Email', 'email', 'email']] as const).map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                    <input type={type} required={key === 'name'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Address</label>
                  <textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Supplier'}
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
              <h3 className="font-display font-bold text-lg text-foreground mb-2">Delete Supplier?</h3>
              <p className="text-sm text-muted-foreground mb-6">This will permanently delete <strong>{confirmDelete.name}</strong>. This action cannot be undone.</p>
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
