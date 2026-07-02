import { useState } from 'react';
import {
  Users, TrendingUp, AlertCircle, DollarSign, Search, Plus, Star,
  Phone, Mail, MapPin, Calendar, Edit2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
  getGetCustomersQueryKey,
} from '@/lib/api';

const groupColors: Record<string, string> = {
  VIP:       'bg-amber-100 text-amber-800 border border-amber-200',
  Regular:   'bg-blue-50 text-blue-700 border border-blue-200',
  Wholesale: 'bg-purple-50 text-purple-700 border border-purple-200',
};
const avatarColors = ['bg-orange-400', 'bg-blue-400', 'bg-green-500', 'bg-purple-400', 'bg-pink-400', 'bg-teal-400'];
const getAvatar = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const blank = { name: '', phone: '', email: '', area: '', group: 'Regular', status: 'Active' };

export function Customers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const { data: customers = [], isLoading } = useGetCustomers();

  const create = useCreateCustomer({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetCustomersQueryKey() }); closeModal(); },
      onError: (e: any) => setErr(e?.data?.error ?? e.message ?? 'Failed to create'),
    },
  });

  const update = useUpdateCustomer({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetCustomersQueryKey() }); closeModal(); },
      onError: (e: any) => setErr(e?.data?.error ?? e.message ?? 'Failed to update'),
    },
  });

  const remove = useDeleteCustomer({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
        setConfirmDelete(null);
        setSelected(null);
      },
    },
  });

  const openAdd = () => { setEditing(null); setForm(blank); setErr(''); setModalOpen(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', area: c.area ?? '', group: c.group, status: c.status });
    setErr('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(blank); setErr(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, phone: form.phone || null, email: form.email || null, area: form.area || null };
    if (editing) update.mutate({ id: editing.id, data });
    else create.mutate({ data });
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalOutstanding = customers.reduce((s, c) => s + (c.balance > 0 ? c.balance : 0), 0);
  const totalRevenue = customers.reduce((s, c) => s + c.totalPurchases, 0);

  const stats = [
    { label: 'Total Customers',   value: customers.length.toString(), icon: Users,        color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Active Customers',  value: customers.filter(c => c.status === 'Active').length.toString(), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Outstanding', value: fmt(totalOutstanding),       icon: AlertCircle,  color: 'text-red-600',     bg: 'bg-red-50' },
    { label: 'Total Revenue',     value: fmt(totalRevenue),            icon: DollarSign,   color: 'text-primary',     bg: 'bg-emerald-50' },
  ];

  const isPending = create.isPending || update.isPending;

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer relationships and dues</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} flex-shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-card-foreground leading-none mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0 min-w-0">
          <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…"
                className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Loading customers…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Users className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No customers found</p>
                <button onClick={openAdd} className="text-xs text-primary font-bold hover:underline">Add your first customer</button>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[540px]">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-card-border">
                    {['Customer', 'Contact', 'Group', 'Total Spent', 'Balance Due', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                      onClick={() => setSelected(selected?.id === c.id ? null : c)}
                      className={`border-b border-card-border/50 cursor-pointer transition-colors group ${selected?.id === c.id ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                            {getAvatar(c.name)}
                          </div>
                          <div>
                            <div className={`font-bold transition-colors ${selected?.id === c.id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{c.name}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{c.visits} visits</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-xs font-medium">
                          {c.phone && <div className="flex items-center gap-1.5 text-foreground"><Phone className="w-3 h-3 text-muted-foreground" />{c.phone}</div>}
                          {c.email && <div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3 h-3" />{c.email}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${groupColors[c.group] ?? groupColors['Regular']}`}>{c.group}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{fmt(c.totalPurchases)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${c.balance > 0 ? 'text-red-600 bg-red-50 px-2 py-1 rounded-md' : 'text-green-600'}`}>{fmt(c.balance)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className={`inline-block w-2.5 h-2.5 rounded-full ${c.status === 'Active' ? 'bg-green-500' : 'bg-muted-foreground'}`} title={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl text-xs font-semibold text-muted-foreground">
            {filtered.length} of {customers.length} customers
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, width: 0, x: 20 }} animate={{ opacity: 1, width: 296, x: 0 }} exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-card-border relative text-center">
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/70 border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white shadow-md mb-3 ${avatarColors[customers.indexOf(selected) % avatarColors.length]}`}>
                  {getAvatar(selected.name)}
                </div>
                <h2 className="text-lg font-display font-bold text-foreground mb-0.5">{selected.name}</h2>
                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${groupColors[selected.group] ?? groupColors['Regular']}`}>{selected.group} Customer</span>
              </div>
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Info</h3>
                  {selected.phone && <div className="flex items-center gap-2.5 text-sm font-medium text-foreground"><Phone className="w-4 h-4 text-primary" />{selected.phone}</div>}
                  {selected.email && <div className="flex items-center gap-2.5 text-sm font-medium text-foreground"><Mail className="w-4 h-4 text-primary" />{selected.email}</div>}
                  {selected.area && <div className="flex items-center gap-2.5 text-sm font-medium text-foreground"><MapPin className="w-4 h-4 text-primary" />{selected.area}</div>}
                  <div className="flex items-center gap-2.5 text-sm font-medium text-foreground"><Calendar className="w-4 h-4 text-primary" />Since {new Date(selected.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
                    <div className="text-lg font-display font-bold text-foreground">{fmt(selected.totalPurchases)}</div>
                    <div className="text-xs font-semibold text-muted-foreground">Total Spent</div>
                  </div>
                  <div className={`border rounded-xl p-3 shadow-sm ${selected.balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className={`text-lg font-display font-bold ${selected.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>{fmt(selected.balance)}</div>
                    <div className={`text-xs font-semibold ${selected.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>Balance Due</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm col-span-2">
                    <div className="text-lg font-display font-bold text-amber-700">{selected.visits} visits</div>
                    <div className="text-xs font-semibold text-amber-500">Total Visits</div>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <button onClick={() => openEdit(selected)} className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors shadow-sm">Edit Customer</button>
                  <button onClick={() => setConfirmDelete(selected)} className="w-full py-2.5 rounded-xl bg-background border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors shadow-sm">
                    Deactivate
                  </button>
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
                <h2 className="font-display font-bold text-lg text-card-foreground">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Area / Location</label>
                    <input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Group</label>
                    <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      {['Regular', 'VIP', 'Wholesale'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  {editing && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">Status</label>
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                        <option>Active</option><option>Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Customer'}
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
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-foreground mb-2">Deactivate Customer?</h3>
              <p className="text-sm text-muted-foreground mb-6">This will mark <strong>{confirmDelete.name}</strong> as Inactive. They can be reactivated later.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-accent transition-colors">Cancel</button>
                <button disabled={remove.isPending} onClick={() => remove.mutate({ id: confirmDelete.id })}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60">
                  {remove.isPending ? 'Deactivating…' : 'Deactivate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
