import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity, ShoppingCart, Package, Users, DollarSign, Settings,
  LogIn, LogOut, Edit2, Plus, Trash2, Search, X, Filter, Clock
} from 'lucide-react';

interface LogEntry {
  id: number; action: string; module: string; user: string; detail: string;
  ip: string; timestamp: string; severity: 'info' | 'success' | 'warning' | 'danger';
}

const now = Date.now();

const mockLogs: LogEntry[] = [
  { id: 1, action: 'Login', module: 'Auth', user: 'Admin User', detail: 'Logged into the system', ip: '192.168.1.100', timestamp: new Date(now - 2 * 60000).toISOString(), severity: 'info' },
  { id: 2, action: 'Sale Created', module: 'POS', user: 'Admin User', detail: 'Receipt #TXN-0042 — ৳4,250 — Cash', ip: '192.168.1.100', timestamp: new Date(now - 8 * 60000).toISOString(), severity: 'success' },
  { id: 3, action: 'Product Updated', module: 'Products', user: 'Sara Ahmed', detail: 'Updated price of Royal Canin Kitten 2kg', ip: '192.168.1.101', timestamp: new Date(now - 22 * 60000).toISOString(), severity: 'warning' },
  { id: 4, action: 'Stock Adjusted', module: 'Inventory', user: 'Admin User', detail: 'Added 50 units to Pedigree Adult Chicken', ip: '192.168.1.100', timestamp: new Date(now - 45 * 60000).toISOString(), severity: 'info' },
  { id: 5, action: 'Customer Added', module: 'Customers', user: 'Sara Ahmed', detail: 'New customer: Rashida Begum (VIP)', ip: '192.168.1.101', timestamp: new Date(now - 1.5 * 3600000).toISOString(), severity: 'success' },
  { id: 6, action: 'Expense Recorded', module: 'Expenses', user: 'Admin User', detail: 'Utility bill — ৳8,500 — Paid', ip: '192.168.1.100', timestamp: new Date(now - 2 * 3600000).toISOString(), severity: 'info' },
  { id: 7, action: 'Purchase Order', module: 'Purchases', user: 'Admin User', detail: 'PO-0018 created — Apex Supplies — ৳35,000', ip: '192.168.1.100', timestamp: new Date(now - 3 * 3600000).toISOString(), severity: 'success' },
  { id: 8, action: 'Supplier Updated', module: 'Suppliers', user: 'Sara Ahmed', detail: "Updated Apex Pet Supplies' contact info", ip: '192.168.1.101', timestamp: new Date(now - 4 * 3600000).toISOString(), severity: 'info' },
  { id: 9, action: 'Product Deleted', module: 'Products', user: 'Admin User', detail: 'Removed discontinued SKU: CAT-DRY-099', ip: '192.168.1.100', timestamp: new Date(now - 5 * 3600000).toISOString(), severity: 'danger' },
  { id: 10, action: 'Settings Changed', module: 'Settings', user: 'Admin User', detail: 'Receipt footer message updated', ip: '192.168.1.100', timestamp: new Date(now - 6 * 3600000).toISOString(), severity: 'warning' },
  { id: 11, action: 'Login Failed', module: 'Auth', user: 'Unknown', detail: 'Failed login attempt (wrong password)', ip: '192.168.1.55', timestamp: new Date(now - 7 * 3600000).toISOString(), severity: 'danger' },
  { id: 12, action: 'Sale Created', module: 'POS', user: 'Rahim Cashier', detail: 'Receipt #TXN-0041 — ৳1,800 — bKash', ip: '192.168.1.102', timestamp: new Date(now - 8 * 3600000).toISOString(), severity: 'success' },
  { id: 13, action: 'Customer Updated', module: 'Customers', user: 'Sara Ahmed', detail: 'Updated balance for Kamal Hossain', ip: '192.168.1.101', timestamp: new Date(now - 24 * 3600000).toISOString(), severity: 'info' },
  { id: 14, action: 'Employee Added', module: 'Employees', user: 'Admin User', detail: 'New employee: Sadia Rahman — Cashier', ip: '192.168.1.100', timestamp: new Date(now - 25 * 3600000).toISOString(), severity: 'success' },
  { id: 15, action: 'Logout', module: 'Auth', user: 'Rahim Cashier', detail: 'Session ended normally', ip: '192.168.1.102', timestamp: new Date(now - 26 * 3600000).toISOString(), severity: 'info' },
];

const moduleIcons: Record<string, any> = {
  Auth: LogIn, POS: ShoppingCart, Products: Package, Customers: Users,
  Inventory: Package, Expenses: DollarSign, Purchases: ShoppingCart,
  Suppliers: Users, Settings: Settings, Employees: Users,
};

const severityCfg = {
  info:    { cls: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  success: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  warning: { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',    dot: 'bg-yellow-500' },
  danger:  { cls: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500' },
};

const fmtTime = (s: string) => {
  const d = new Date(s);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const modules = ['All', ...Array.from(new Set(mockLogs.map(l => l.module)))];
const severities = ['all', 'info', 'success', 'warning', 'danger'];

export function ActivityLog() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = mockLogs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.action.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q) || l.user.toLowerCase().includes(q);
    const matchModule = moduleFilter === 'All' || l.module === moduleFilter;
    const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
    return matchSearch && matchModule && matchSeverity;
  });

  const stats = [
    { label: 'Total Events', value: mockLogs.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Errors', value: mockLogs.filter(l => l.severity === 'danger').length.toString(), color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Warnings', value: mockLogs.filter(l => l.severity === 'warning').length.toString(), color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Success', value: mockLogs.filter(l => l.severity === 'success').length.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Audit trail of all system events and user actions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}>
              <Activity className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`font-display font-bold text-xl leading-none mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action, user, detail…"
                className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground" />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-2 shadow-sm">
              <Filter className="w-4 h-4 text-primary" />
              <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="text-sm font-semibold text-foreground outline-none bg-transparent cursor-pointer">
                {modules.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {severities.map(s => (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${severityFilter === s ? 'bg-primary text-white shadow-sm' : 'bg-background border border-border text-foreground hover:bg-accent'}`}>
                {s === 'all' ? 'All Levels' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Activity className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No log entries match your filters</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['Severity', 'Action', 'Module', 'User', 'Detail', 'IP', 'Time'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const sc = severityCfg[log.severity];
                  const MIcon = moduleIcons[log.module] ?? Activity;
                  return (
                    <motion.tr key={log.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
                      className="border-b border-card-border/50 hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{log.action}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <MIcon className="w-3.5 h-3.5" />{log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{log.user}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[240px] truncate">{log.detail}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold whitespace-nowrap">
                          <Clock className="w-3 h-3" />{fmtTime(log.timestamp)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-3 border-t border-card-border bg-accent/10 rounded-b-2xl flex justify-between text-xs font-semibold text-muted-foreground">
          <span>Showing {filtered.length} of {mockLogs.length} events</span>
          <span className="text-primary">Last updated: just now</span>
        </div>
      </div>
    </div>
  );
}
