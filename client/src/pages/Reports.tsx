import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, DollarSign, ShoppingCart, Users, Package2,
  BarChart3, Download, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const fmt = (n: number) => `৳${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtFull = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EMERALD = '#10b981';
const CHART_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 100 ? fmt(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

export function Reports() {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');

  const { data: stats } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const r = await fetch('/api/dashboard/stats', { credentials: 'include' }); return r.json(); },
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ['transactions'],
    queryFn: async () => { const r = await fetch('/api/transactions', { credentials: 'include' }); return r.json(); },
  });

  const { data: expenses = [] } = useQuery<any[]>({
    queryKey: ['expenses'],
    queryFn: async () => { const r = await fetch('/api/expenses', { credentials: 'include' }); return r.json(); },
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: async () => { const r = await fetch('/api/products', { credentials: 'include' }); return r.json(); },
  });

  const now = new Date();

  const getDailyData = () => {
    const days: Record<string, { revenue: number; orders: number; expenses: number }> = {};
    const cutoff = new Date(now);
    if (range === 'week') cutoff.setDate(now.getDate() - 6);
    else if (range === 'month') cutoff.setDate(now.getDate() - 29);
    else cutoff.setFullYear(now.getFullYear() - 1);

    transactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      if (d >= cutoff) {
        const key = range === 'year'
          ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!days[key]) days[key] = { revenue: 0, orders: 0, expenses: 0 };
        days[key].revenue += tx.total;
        days[key].orders += 1;
      }
    });
    expenses.forEach((ex: any) => {
      const d = new Date(ex.date || ex.createdAt);
      if (d >= cutoff) {
        const key = range === 'year'
          ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!days[key]) days[key] = { revenue: 0, orders: 0, expenses: 0 };
        days[key].expenses += ex.amount;
      }
    });

    return Object.entries(days).map(([name, v]) => ({ name, ...v, profit: v.revenue - v.expenses }));
  };

  const getPaymentMethodData = () => {
    const m: Record<string, number> = {};
    transactions.forEach(tx => { m[tx.paymentMethod] = (m[tx.paymentMethod] || 0) + tx.total; });
    return Object.entries(m).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  };

  const getCategoryData = () => {
    const m: Record<string, { revenue: number; qty: number }> = {};
    transactions.forEach(tx => {
      tx.items?.forEach((item: any) => {
        const prod = products.find((p: any) => p.name === item.productName);
        const cat = prod?.category ?? 'Other';
        if (!m[cat]) m[cat] = { revenue: 0, qty: 0 };
        m[cat].revenue += item.lineTotal;
        m[cat].qty += item.qty;
      });
    });
    return Object.entries(m).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);
  };

  const dailyData = getDailyData();
  const paymentData = getPaymentMethodData();
  const categoryData = getCategoryData();

  const totalRevenue = transactions.reduce((s: number, t: any) => s + t.total, 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const totalOrders = transactions.length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
  const grossProfit = totalRevenue - totalExpenses;

  const kpis = [
    { label: 'Total Revenue', value: fmtFull(totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.4%', up: true },
    { label: 'Gross Profit', value: fmtFull(grossProfit), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8.1%', up: true },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-violet-600', bg: 'bg-violet-50', trend: '+5.3%', up: true },
    { label: 'Avg Order Value', value: fmtFull(avgOrder), icon: BarChart3, color: 'text-primary', bg: 'bg-orange-50', trend: '+2.7%', up: true },
  ];

  const ranges = [
    { label: '7 Days', value: 'week' as const },
    { label: '30 Days', value: 'month' as const },
    { label: '12 Months', value: 'year' as const },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto overflow-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Business performance at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
            {ranges.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3 py-2 text-xs font-bold transition-all ${range === r.value ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-card-border shadow-sm text-sm font-bold text-foreground hover:bg-accent transition-colors">
            <Download className="w-4 h-4 text-primary" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-card border border-card-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.bg}`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
              <span className={`flex items-center gap-0.5 text-xs font-bold ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{k.trend}
              </span>
            </div>
            <div className="font-display font-bold text-xl text-card-foreground leading-none mb-1">{k.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-foreground">Revenue vs Expenses</h2>
            <span className="text-xs font-semibold text-muted-foreground">{ranges.find(r => r.value === range)?.label}</span>
          </div>
          {dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data for selected range</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={EMERALD} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `৳${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={EMERALD} fill="url(#revGrad)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-bold text-foreground mb-4">Payment Methods</h2>
          {paymentData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {paymentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {paymentData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="font-semibold text-foreground">{d.name}</span>
                    </div>
                    <span className="font-bold text-muted-foreground">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-bold text-foreground mb-4">Revenue by Category</h2>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `৳${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-bold text-foreground mb-4">Daily Orders</h2>
          {dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
