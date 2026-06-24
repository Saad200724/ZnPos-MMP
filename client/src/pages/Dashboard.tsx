import { useState } from 'react';
import {
  DollarSign, ShoppingCart, Users, AlertTriangle, ArrowUpRight,
  TrendingUp, Package, Receipt, Leaf, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid
} from 'recharts';
import { useGetDashboardStats } from '@/lib/api';

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, type: 'spring' as const, stiffness: 220, damping: 22 },
});

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState('Monthly');
  const { data: stats, isLoading } = useGetDashboardStats();

  const statCards = [
    {
      label: "Today's Sales",
      value: `৳${stats?.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`,
      change: '+12%', up: true,
      icon: DollarSign,
      gradient: 'from-emerald-500/12 to-emerald-500/4',
      iconBg: 'bg-emerald-100 text-emerald-700',
      accent: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total Orders',
      value: stats?.todayOrders.toString() ?? '0',
      change: '+5%', up: true,
      icon: ShoppingCart,
      gradient: 'from-blue-500/12 to-blue-500/4',
      iconBg: 'bg-blue-100 text-blue-700',
      accent: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Customers Due',
      value: `৳${stats?.totalDueAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`,
      change: 'Due', up: false,
      icon: Users,
      gradient: 'from-rose-500/12 to-rose-500/4',
      iconBg: 'bg-rose-100 text-rose-600',
      accent: 'text-rose-600',
      badgeBg: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Low Stock Items',
      value: stats?.lowStockCount.toString() ?? '0',
      change: 'Alert', up: false,
      icon: AlertTriangle,
      gradient: 'from-amber-500/12 to-amber-500/4',
      iconBg: 'bg-amber-100 text-amber-700',
      accent: 'text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className={`p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} {...fadeUp(i * 0.07)}
            className={`stat-card bg-gradient-to-br ${card.gradient} cursor-default`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.iconBg} flex-shrink-0`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                {card.up && <ArrowUpRight className="w-3 h-3" />}
                {card.change}
              </span>
            </div>
            <div className={`text-2xl md:text-3xl font-display font-extrabold ${card.accent} leading-none mb-1`}>
              {card.value}
            </div>
            <div className="text-xs font-semibold text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Sales Overview — area chart */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-2 clay-card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Activity className="w-4 h-4 text-primary" />
                <span className="font-display font-bold text-card-foreground text-base">Sales Overview</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Total: ৳{stats?.monthlySales.reduce((s, m) => s + m.sales, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
              </div>
            </div>
            <div className="flex bg-accent/80 rounded-xl p-1 border border-border gap-0.5">
              {['Daily', 'Monthly', 'Yearly'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeFilter === f
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlySales ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip
                  cursor={{ stroke: 'rgba(22,163,74,0.15)', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '12px', border: '1.5px solid #d1fae5', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: 'Nunito Sans', fontSize: '13px' }}
                  formatter={(val: number) => [`৳${val.toLocaleString()}`, 'Sales']}
                />
                <Area dataKey="sales" stroke="#16a34a" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#16a34a' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Categories donut */}
        <motion.div {...fadeUp(0.28)} className="clay-card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-card-foreground text-base">Top Categories</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={stats?.topCategories ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats?.topCategories ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Share']}
                  contentStyle={{ borderRadius: '10px', border: '1.5px solid #d1fae5', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-1">
              {(stats?.topCategories ?? []).slice(0, 5).map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
                    <span className="text-muted-foreground text-xs font-medium truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-1.5 rounded-full bg-border w-16 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${cat.value}%`, background: cat.fill }} />
                    </div>
                    <span className="text-xs font-bold text-card-foreground w-7 text-right">{cat.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">

        {/* Low Stock Alert */}
        <motion.div {...fadeUp(0.34)} className="clay-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-amber-100">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="font-display font-bold text-card-foreground text-sm leading-tight">Low Stock Alert</div>
                <div className="text-[11px] text-muted-foreground">{stats?.lowStockCount ?? 0} items need restocking</div>
              </div>
            </div>
            <button className="text-xs font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-primary/8">
              View All
            </button>
          </div>
          <div className="space-y-1.5">
            {(stats?.lowStockItems ?? []).map(item => (
              <div key={item.sku}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/70 transition-all duration-200 border border-transparent hover:border-border/60 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-background border border-border flex-shrink-0">
                  <Package className="w-4 h-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors leading-tight">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground/70 font-mono">{item.sku}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-red-500">{item.stock}</div>
                  <div className="text-[11px] text-muted-foreground">/ {item.minStock} min</div>
                </div>
              </div>
            ))}
            {(stats?.lowStockItems ?? []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Leaf className="w-9 h-9 opacity-25" />
                <p className="text-sm font-medium">All stock levels healthy</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div {...fadeUp(0.40)} className="clay-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-emerald-100">
                <Receipt className="w-[18px] h-[18px] text-emerald-700" />
              </div>
              <div>
                <div className="font-display font-bold text-card-foreground text-sm leading-tight">Recent Transactions</div>
                <div className="text-[11px] text-muted-foreground">Latest sales activity</div>
              </div>
            </div>
            <button className="text-xs font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-primary/8">
              View All
            </button>
          </div>
          <div className="space-y-1.5">
            {(stats?.recentTransactions ?? []).map(sale => (
              <div key={sale.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/70 transition-all duration-200 border border-transparent hover:border-border/60 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100 flex-shrink-0">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors leading-tight truncate">
                    {sale.customerName || 'Walk-in Customer'}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {sale.receiptNo} · {sale.items?.length ?? 0} items
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-card-foreground">৳{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${sale.status === 'Completed' || sale.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-[11px] text-muted-foreground">{relativeTime(sale.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {(stats?.recentTransactions ?? []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <ShoppingCart className="w-9 h-9 opacity-25" />
                <p className="text-sm font-medium">No recent transactions</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
