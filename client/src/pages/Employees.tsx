import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, UserCheck, Briefcase, Search, Plus, X, Edit2, Phone, Mail, Building2, AlertCircle } from 'lucide-react';

interface Employee {
  id: number; name: string; phone: string | null; email: string | null;
  role: string; department: string; salary: number; joiningDate: string;
  address: string | null; nid: string | null; status: string; createdAt: string;
}

const fmt = (n: number) => `৳${n.toLocaleString()}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const deptColors: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700', Sales: 'bg-blue-100 text-blue-700',
  Management: 'bg-purple-100 text-purple-700', Warehouse: 'bg-amber-100 text-amber-700',
  Finance: 'bg-green-100 text-green-700', IT: 'bg-cyan-100 text-cyan-700',
};
const avatarColors = ['bg-orange-400', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500'];

const ROLES = ['Admin', 'Manager', 'Staff', 'Cashier', 'Supervisor', 'Driver'];
const DEPTS = ['General', 'Sales', 'Management', 'Warehouse', 'Finance', 'IT'];
const blank = { name: '', phone: '', email: '', role: 'Staff', department: 'General', salary: '', joiningDate: '', address: '', nid: '', status: 'Active' };

export function Employees() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState('');

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => { const r = await fetch('/api/employees', { credentials: 'include' }); return r.json(); },
  });

  const save = useMutation({
    mutationFn: async (data: any) => {
      const url = editing ? `/api/employees/${editing.id}` : '/api/employees';
      const r = await fetch(url, { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, salary: Number(data.salary) }) });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed');
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); closeModal(); },
    onError: (e: any) => setErr(e.message),
  });

  const deactivate = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/employees/${id}`, { method: 'DELETE', credentials: 'include' }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const openAdd = () => { setEditing(null); setForm(blank); setErr(''); setModalOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setForm({ name: e.name, phone: e.phone ?? '', email: e.email ?? '', role: e.role, department: e.department, salary: e.salary, joiningDate: e.joiningDate?.slice(0, 10) ?? '', address: e.address ?? '', nid: e.nid ?? '', status: e.status }); setErr(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(blank); setErr(''); };

  const active = employees.filter(e => e.status === 'Active');
  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase()));
  const totalSalary = active.reduce((s, e) => s + e.salary, 0);

  const stats = [
    { label: 'Total Staff', value: employees.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: active.length.toString(), icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Monthly Payroll', value: fmt(totalSalary), icon: DollarSign, color: 'text-primary', bg: 'bg-green-50' },
    { label: 'Departments', value: [...new Set(employees.map(e => e.department))].length.toString(), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage staff records and payroll</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Employee
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

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, role, department…"
              className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Users className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['Employee', 'Role', 'Department', 'Contact', 'Salary', 'Joined', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const initials = emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const ac = avatarColors[emp.id % avatarColors.length];
                  return (
                    <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 15) * 0.02 }}
                      className="border-b border-card-border/50 hover:bg-accent/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${ac}`}>{initials}</div>
                          <div><p className="font-bold text-foreground leading-tight">{emp.name}</p><p className="text-xs text-muted-foreground">#{emp.id}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-muted-foreground" /><span className="font-semibold text-foreground">{emp.role}</span></span></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${deptColors[emp.department] ?? 'bg-gray-100 text-gray-700'}`}>{emp.department}</span></td>
                      <td className="px-4 py-3">
                        {emp.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{emp.phone}</div>}
                        {emp.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{emp.email}</div>}
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-foreground">{fmt(emp.salary)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(emp.joiningDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{emp.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(emp)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          {emp.status === 'Active' && <button onClick={() => deactivate.mutate(emp.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
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
                <h2 className="font-display font-bold text-lg text-card-foreground">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-5 space-y-4" onSubmit={e => { e.preventDefault(); save.mutate(form); }}>
                {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}
                <div className="grid grid-cols-2 gap-3">
                  {[['Full Name', 'name', 'text', 'col-span-2'], ['Phone', 'phone', 'tel', ''], ['Email', 'email', 'email', ''], ['NID Number', 'nid', 'text', ''], ['Monthly Salary (৳)', 'salary', 'number', '']].map(([label, key, type, cls]) => (
                    <div key={key} className={cls || 'col-span-1'}>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                      <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key === 'name'}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary transition-colors" />
                    </div>
                  ))}
                  {[['Role', 'role', ROLES], ['Department', 'department', DEPTS], ['Status', 'status', ['Active', 'Inactive', 'On Leave']]].map(([label, key, opts]) => (
                    <div key={key as string}>
                      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
                      <select value={form[key as string]} onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary transition-colors">
                        {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Joining Date</label>
                    <input type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5">Address</label>
                    <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors">Cancel</button>
                  <button type="submit" disabled={save.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {save.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Employee'}
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
