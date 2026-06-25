import { useState } from 'react';
import {
  DollarSign, ShoppingCart, Users, AlertTriangle, ArrowUpRight,
  TrendingUp, Package, Receipt, Leaf, Activity, Trophy, Crown,
  Star, Truck, CreditCard, Banknote, Wallet, PhoneCall, UserCheck,
  BadgeDollarSign, ChevronRight, Building2
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

const RANK_STYLES = [
  { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300', icon: Crown },
  { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-300', icon: Trophy },
  { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-300', icon: Star },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', icon: Star },
  { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200', icon: Star },
];

const METHOD_STYLE: Record<string, { icon: typeof CreditCard; gradient: string; accent: string; light: string }> = {
  Cash:    { icon: Banknote,    gradient: 'from-emerald-500 to-teal-500',  accent: 'text-emerald-700', light: 'bg-emerald-100' },
  Card:    { icon: CreditCard,  gradient: 'from-blue-500 to-indigo-500',   accent: 'text-blue-700',    light: 'bg-blue-100'    },
  MFS:     { icon: Wallet,      gradient: 'from-purple-500 to-pink-500',   accent: 'text-purple-700',  light: 'bg-purple-100'  },
  bKash:   { icon: Wallet,      gradient: 'from-pink-500 to-rose-500',     accent: 'text-pink-700',    light: 'bg-pink-100'    },
  Nagad:   { icon: Wallet,      gradient: 'from-orange-500 to-amber-500',  accent: 'text-orange-700',  light: 'bg-orange-100'  },
  Default: { icon: BadgeDollarSign, gradient: 'from-slate-500 to-gray-500', accent: 'text-slate-700', light: 'bg-slate-100'  },
};

const GROUP_BADGE: Record<string, string> = {
  VIP:     'bg-amber-100 text-amber-700 border-amber-200',
  Regular: 'bg-blue-50 text-blue-600 border-blue-200',
  Wholesale: 'bg-violet-100 text-violet-700 border-violet-200',
};

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

  const topProductsMax = Math.max(...(stats?.topProducts ?? []).map(p => p.revenue), 1);
  const topCustomersMax = Math.max(...(stats?.topCustomers ?? []).map(c => c.totalPurchases), 1);
  const incomeTotal = (stats?.incomeByAccount ?? []).reduce((s, m) => s + m.amount, 0);

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

      {/* ── Low Stock + Recent Transactions ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Low Stock Alert */}
        <motion.div {...fadeUp(0.34)} className="clay-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-amber-100">
                <AlertTriangle className="w-[18px] h-[18px] text-amber-600" />
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

      {/* ── Top Products + Top Customers (2-col) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Products */}
        <motion.div {...fadeUp(0.46)} className="clay-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-violet-100">
                <Trophy className="w-[18px] h-[18px] text-violet-600" />
              </div>
              <div>
                <div className="font-display font-bold text-card-foreground text-sm leading-tight">Top Products</div>
                <div className="text-[11px] text-muted-foreground">By revenue this year</div>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-primary/8">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {(stats?.topProducts ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Package className="w-9 h-9 opacity-25" />
              <p className="text-sm font-medium">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(stats?.topProducts ?? []).map((prod, i) => {
                const rankStyle = RANK_STYLES[i] ?? RANK_STYLES[4];
                const RankIcon = rankStyle.icon;
                const pct = Math.round((prod.revenue / topProductsMax) * 100);
                return (
                  <div key={prod.id} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-accent/60 transition-all duration-200 border border-transparent hover:border-border/50">
                    {/* Rank badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${rankStyle.bg} ${rankStyle.ring}`}>
                      {i === 0 ? (
                        <Crown className={`w-4 h-4 ${rankStyle.text}`} />
                      ) : (
                        <span className={`text-xs font-extrabold ${rankStyle.text}`}>{i + 1}</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors leading-tight">{prod.name}</span>
                        <span className="text-sm font-extrabold text-emerald-600 flex-shrink-0">৳{prod.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">{prod.units} units</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Top Customers */}
        <motion.div {...fadeUp(0.52)} className="clay-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-sky-100">
                <UserCheck className="w-[18px] h-[18px] text-sky-600" />
              </div>
              <div>
                <div className="font-display font-bold text-card-foreground text-sm leading-tight">Top Customers</div>
                <div className="text-[11px] text-muted-foreground">By lifetime spend</div>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-primary/8">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {(stats?.topCustomers ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Users className="w-9 h-9 opacity-25" />
              <p className="text-sm font-medium">No customer data yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(stats?.topCustomers ?? []).map((cust, i) => {
                const rankStyle = RANK_STYLES[i] ?? RANK_STYLES[4];
                const pct = Math.round((cust.totalPurchases / topCustomersMax) * 100);
                const groupBadge = GROUP_BADGE[cust.group] ?? 'bg-gray-100 text-gray-600 border-gray-200';
                const initials = cust.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={cust.id} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-accent/60 transition-all duration-200 border border-transparent hover:border-border/50">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 font-extrabold text-xs ${rankStyle.bg} ${rankStyle.text} ${rankStyle.ring}`}>
                      {i === 0 ? <Crown className="w-4 h-4" /> : initials}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors leading-tight">{cust.name}</span>
                          <span className={`hidden sm:inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-bold border flex-shrink-0 ${groupBadge}`}>{cust.group}</span>
                        </div>
                        <span className="text-sm font-extrabold text-sky-600 flex-shrink-0">৳{cust.totalPurchases.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.55 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">{cust.visits} visits</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Income by Account + Customer Due + Supplier Due (3-col) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">

        {/* Income by Account */}
        <motion.div {...fadeUp(0.58)} className="clay-card p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-indigo-100">
              <BadgeDollarSign className="w-[18px] h-[18px] text-indigo-600" />
            </div>
            <div>
              <div className="font-display font-bold text-card-foreground text-sm leading-tight">Income by Account</div>
              <div className="text-[11px] text-muted-foreground">Payment method split</div>
            </div>
          </div>

          {/* Total */}
          <div className="mb-4 px-3 py-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-100">
            <div className="text-[11px] text-indigo-600 font-semibold mb-0.5">Total Income</div>
            <div className="text-xl font-extrabold text-indigo-700 font-display">
              ৳{incomeTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>

          {(stats?.incomeByAccount ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 flex-1">
              <Wallet className="w-9 h-9 opacity-25" />
              <p className="text-sm font-medium">No income recorded</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {(stats?.incomeByAccount ?? []).map((acc) => {
                const style = METHOD_STYLE[acc.method] ?? METHOD_STYLE.Default;
                const MethodIcon = style.icon;
                return (
                  <div key={acc.method} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${style.light} flex-shrink-0`}>
                          <MethodIcon className={`w-3.5 h-3.5 ${style.accent}`} />
                        </div>
                        <span className="text-xs font-semibold text-card-foreground">{acc.method}</span>
                        <span className="text-[10px] text-muted-foreground">({acc.count} txn)</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-extrabold ${style.accent}`}>৳{acc.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{acc.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${style.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${acc.pct}%` }}
                        transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Customer Due Amount */}
        <motion.div {...fadeUp(0.63)} className="clay-card p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-rose-100">
              <Users className="w-[18px] h-[18px] text-rose-600" />
            </div>
            <div>
              <div className="font-display font-bold text-card-foreground text-sm leading-tight">Customer Due</div>
              <div className="text-[11px] text-muted-foreground">{stats?.totalCustomersDue ?? 0} customers with dues</div>
            </div>
          </div>

          {/* Total */}
          <div className="mb-4 px-3 py-2.5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-100">
            <div className="text-[11px] text-rose-600 font-semibold mb-0.5">Total Outstanding</div>
            <div className="text-xl font-extrabold text-rose-700 font-display">
              ৳{(stats?.totalDueAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {(stats?.customerDueList ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 flex-1">
              <Users className="w-9 h-9 opacity-25" />
              <p className="text-sm font-medium">No outstanding dues</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {(stats?.customerDueList ?? []).map((cust, i) => {
                const initials = cust.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
                const hues = ['bg-rose-100 text-rose-700', 'bg-pink-100 text-pink-700', 'bg-orange-100 text-orange-700', 'bg-amber-100 text-amber-700', 'bg-red-100 text-red-700'];
                return (
                  <div key={cust.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-50/60 transition-colors cursor-pointer border border-transparent hover:border-rose-100">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${hues[i % hues.length]}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-card-foreground truncate leading-tight">{cust.name}</div>
                      {cust.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <PhoneCall className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{cust.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-extrabold text-rose-600">৳{cust.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Supplier Due Amount */}
        <motion.div {...fadeUp(0.68)} className="clay-card p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-amber-100">
              <Truck className="w-[18px] h-[18px] text-amber-600" />
            </div>
            <div>
              <div className="font-display font-bold text-card-foreground text-sm leading-tight">Supplier Due</div>
              <div className="text-[11px] text-muted-foreground">Payable to suppliers</div>
            </div>
          </div>

          {/* Total */}
          <div className="mb-4 px-3 py-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-100">
            <div className="text-[11px] text-amber-700 font-semibold mb-0.5">Total Payable</div>
            <div className="text-xl font-extrabold text-amber-800 font-display">
              ৳{(stats?.supplierDueAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {(stats?.supplierDueList ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 flex-1">
              <Building2 className="w-9 h-9 opacity-25" />
              <p className="text-sm font-medium">No payables outstanding</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {(stats?.supplierDueList ?? []).map((sup, i) => {
                const hues = ['bg-amber-100 text-amber-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700', 'bg-rose-100 text-rose-700'];
                const initials = sup.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={sup.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/60 transition-colors cursor-pointer border border-transparent hover:border-amber-100">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${hues[i % hues.length]}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-card-foreground truncate leading-tight">{sup.name}</div>
                      {sup.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <PhoneCall className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{sup.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-extrabold text-amber-700">৳{sup.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
