import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Landmark, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp,
  TrendingDown, CreditCard, Banknote, PiggyBank, BarChart3, Plus, X, Eye
} from 'lucide-react';

const fmt = (n: number) => `৳${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

export function Accounts() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ['transactions'],
    queryFn: async () => { const r = await fetch('/api/transactions', { credentials: 'include' }); return r.json(); },
  });

  const { data: expenses = [] } = useQuery<any[]>({
    queryKey: ['expenses'],
    queryFn: async () => { const r = await fetch('/api/expenses', { credentials: 'include' }); return r.json(); },
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['customers'],
    queryFn: async () => { const r = await fetch('/api/customers', { credentials: 'include' }); return r.json(); },
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: async () => { const r = await fetch('/api/suppliers', { credentials: 'include' }); return r.json(); },
  });

  const totalRevenue = transactions.reduce((s: number, t: any) => s + t.total, 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const grossProfit = totalRevenue - totalExpenses;
  const customerDue = customers.reduce((s: number, c: any) => s + (c.balance > 0 ? c.balance : 0), 0);
  const supplierDue = suppliers.reduce((s: number, sup: any) => s + (sup.balance < 0 ? Math.abs(sup.balance) : 0), 0);

  const accounts = [
    { name: 'Cash Account', balance: totalRevenue * 0.45, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.4%', up: true },
    { name: 'Bank Account', balance: totalRevenue * 0.35, icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8.1%', up: true },
    { name: 'Mobile Money (bKash)', balance: totalRevenue * 0.15, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50', trend: '+4.2%', up: true },
    { name: 'Savings', balance: totalRevenue * 0.05, icon: PiggyBank, color: 'text-violet-600', bg: 'bg-violet-50', trend: '+1.1%', up: true },
  ];

  const summary = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', positive: true },
    { label: 'Total Expenses', value: fmt(totalExpenses), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50', positive: false },
    { label: 'Gross Profit', value: fmt(grossProfit), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', positive: grossProfit >= 0 },
    { label: 'Customer Dues', value: fmt(customerDue), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50', positive: true },
  ];

  const ledger = [
    ...transactions.slice(0, 15).map((t: any) => ({
      id: t.id, date: t.createdAt, desc: `Sale — ${t.customerName}`, ref: t.receiptNo,
      type: 'credit' as const, amount: t.total, account: 'Revenue',
    })),
    ...expenses.slice(0, 10).map((e: any) => ({
      id: -e.id, date: e.date || e.createdAt, desc: e.title, ref: e.reference || `EXP-${e.id}`,
      type: 'debit' as const, amount: e.amount, account: e.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto overflow-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Financial overview and ledger summary</p>
        </div>
        <div className="flex bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
          {(['overview', 'ledger'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summary.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                className="bg-card border border-card-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <div className={`font-display font-bold text-xl leading-none mb-1 ${s.positive ? 'text-card-foreground' : 'text-red-600'}`}>{s.value}</div>
                <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {accounts.map((acc, i) => (
              <motion.div key={acc.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${acc.bg}`}><acc.icon className={`w-5 h-5 ${acc.color}`} /></div>
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${acc.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {acc.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{acc.trend}
                  </span>
                </div>
                <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{fmt(acc.balance)}</div>
                <div className="text-xs font-bold text-muted-foreground">{acc.name}</div>
                <div className="mt-3 h-1 bg-accent rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60 transition-all group-hover:bg-primary" style={{ width: `${(acc.balance / totalRevenue) * 100}%` }} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              <h2 className="font-display font-bold text-foreground mb-4">Receivables (Customer Dues)</h2>
              <div className="space-y-2">
                {customers.filter((c: any) => c.balance > 0).slice(0, 6).map((c: any, i: number) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-card-border/50 last:border-0">
                    <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    <span className="text-sm font-bold text-red-600">{fmt(c.balance)}</span>
                  </div>
                ))}
                {customers.filter((c: any) => c.balance > 0).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No outstanding dues</p>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              <h2 className="font-display font-bold text-foreground mb-4">Payables (Supplier Dues)</h2>
              <div className="space-y-2">
                {suppliers.filter((s: any) => s.balance < 0).slice(0, 6).map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-card-border/50 last:border-0">
                    <span className="text-sm font-semibold text-foreground">{s.name}</span>
                    <span className="text-sm font-bold text-orange-600">{fmt(Math.abs(s.balance))}</span>
                  </div>
                ))}
                {suppliers.filter((s: any) => s.balance < 0).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No outstanding payables</p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {activeTab === 'ledger' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-card-border bg-accent/20 rounded-t-2xl flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Transaction Ledger</span>
            <span className="text-xs text-muted-foreground font-semibold">Showing latest {ledger.length} entries</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-card-border">
                  {['Date', 'Description', 'Reference', 'Account', 'Debit', 'Credit'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry, i) => (
                  <motion.tr key={`${entry.type}-${entry.id}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.01 }}
                    className="border-b border-card-border/50 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{entry.desc}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-accent px-1.5 py-0.5 rounded text-muted-foreground">{entry.ref}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.account}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{entry.type === 'debit' ? fmt(entry.amount) : '—'}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{entry.type === 'credit' ? fmt(entry.amount) : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
