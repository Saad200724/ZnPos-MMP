import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersRound, ShieldCheck, Shield, UserCog, Eye, Edit2, Trash2,
  Plus, X, AlertCircle, Check, Key, Mail, Phone, Clock
} from 'lucide-react';

interface User { id: number; name: string; email: string; role: string; status: string; lastLogin: string; permissions: string[]; }

const roles = ['Admin', 'Manager', 'Cashier', 'Viewer'];
const allPermissions = ['Sales', 'Products', 'Customers', 'Suppliers', 'Purchases', 'Reports', 'Employees', 'Expenses', 'Settings', 'User Management'];

const roleColors: Record<string, string> = {
  Admin: 'bg-red-100 text-red-700 border-red-200',
  Manager: 'bg-violet-100 text-violet-700 border-violet-200',
  Cashier: 'bg-blue-100 text-blue-700 border-blue-200',
  Viewer: 'bg-gray-100 text-gray-700 border-gray-200',
};

const roleDefaults: Record<string, string[]> = {
  Admin: allPermissions,
  Manager: ['Sales', 'Products', 'Customers', 'Suppliers', 'Purchases', 'Reports', 'Employees', 'Expenses'],
  Cashier: ['Sales', 'Products', 'Customers'],
  Viewer: ['Sales', 'Reports'],
};

const mockUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@mewmew.shop', role: 'Admin', status: 'Active', lastLogin: new Date().toISOString(), permissions: allPermissions },
  { id: 2, name: 'Sara Ahmed', email: 'sara@mewmew.shop', role: 'Manager', status: 'Active', lastLogin: new Date(Date.now() - 86400000).toISOString(), permissions: roleDefaults['Manager'] },
  { id: 3, name: 'Rahim Cashier', email: 'rahim@mewmew.shop', role: 'Cashier', status: 'Active', lastLogin: new Date(Date.now() - 3600000).toISOString(), permissions: roleDefaults['Cashier'] },
];

const avatarColors = ['bg-rose-500', 'bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-amber-500'];
const blank = { name: '', email: '', role: 'Cashier', status: 'Active' };

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selected, setSelected] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');

  const openAdd = () => { setForm(blank); setErr(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setForm(blank); setErr(''); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setErr('Name and email are required.'); return; }
    const newUser: User = {
      id: Date.now(), ...form,
      lastLogin: 'Never',
      permissions: roleDefaults[form.role] ?? [],
    };
    setUsers(prev => [...prev, newUser]);
    closeModal();
  };

  const togglePerm = (user: User, perm: string) => {
    setUsers(prev => prev.map(u => u.id === user.id
      ? { ...u, permissions: u.permissions.includes(perm) ? u.permissions.filter(p => p !== perm) : [...u.permissions, perm] }
      : u
    ));
    if (selected?.id === user.id) {
      setSelected(u => u ? { ...u, permissions: u.permissions.includes(perm) ? u.permissions.filter(p => p !== perm) : [...u.permissions, perm] } : u);
    }
  };

  const activeCount = users.filter(u => u.status === 'Active').length;

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: UsersRound, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: activeCount.toString(), icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Roles', value: roles.length.toString(), icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Permissions', value: allPermissions.length.toString(), icon: Key, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const fmtLogin = (s: string) => {
    if (s === 'Never') return 'Never';
    const d = new Date(s);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage staff accounts, roles and permissions</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add User
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
            <span className="text-sm font-bold text-foreground">{users.length} system users</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <motion.tr key={user.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(selected?.id === user.id ? null : user)}
                      className={`border-b border-card-border/50 cursor-pointer transition-colors group ${selected?.id === user.id ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>{initials}</div>
                          <div>
                            <p className="font-bold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColors[user.role]}`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.status === 'Active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />{user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                          <Clock className="w-3 h-3" />{fmtLogin(user.lastLogin)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setSelected(user); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-muted-foreground hover:text-blue-500 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={e => e.stopPropagation()} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          {user.role !== 'Admin' && <button onClick={e => { e.stopPropagation(); setUsers(prev => prev.filter(u => u.id !== user.id)); if (selected?.id === user.id) setSelected(null); }} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
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
            <motion.div initial={{ opacity: 0, width: 0, x: 20 }} animate={{ opacity: 1, width: 300, x: 0 }} exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-card-border bg-accent/20">
                <h3 className="font-display font-bold text-foreground">Permissions</h3>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${avatarColors[users.findIndex(u => u.id === selected.id) % avatarColors.length]}`}>
                    {selected.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{selected.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${roleColors[selected.role]}`}>{selected.role}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Module Access</h4>
                  <div className="space-y-1.5">
                    {allPermissions.map(perm => {
                      const has = selected.permissions.includes(perm);
                      return (
                        <button key={perm} onClick={() => togglePerm(selected, perm)} disabled={selected.role === 'Admin'}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all ${has ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-background border border-border text-muted-foreground hover:border-primary/30'} ${selected.role === 'Admin' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <span>{perm}</span>
                          {has && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {selected.role === 'Admin' && (
                  <p className="text-xs text-muted-foreground bg-accent/50 rounded-xl p-3">Admin users have all permissions and cannot be restricted.</p>
                )}
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
                <h2 className="font-display font-bold text-lg text-card-foreground">Add System User</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSave}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4" />{err}</div>}
                {[['Full Name *', 'name', 'text'], ['Email *', 'email', 'email']].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                    <input type={type} required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Role</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      {roles.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                      <option>Active</option><option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Add User</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
