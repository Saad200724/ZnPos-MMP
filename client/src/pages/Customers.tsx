import { useState } from 'react';
import { 
  Users, TrendingUp, AlertCircle, DollarSign, Search, Plus, Download, Upload,
  Star, Phone, Mail, MapPin, Calendar, Eye, Edit2, MoreHorizontal, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetCustomers } from '@/lib/api';

const groupColors: Record<string, string> = {
  VIP: 'bg-amber-100 text-amber-800 border border-amber-200',
  Regular: 'bg-blue-50 text-blue-700 border border-blue-200',
  Wholesale: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const avatarColors = ['bg-orange-400', 'bg-blue-400', 'bg-green-500', 'bg-purple-400', 'bg-pink-400', 'bg-teal-400'];

export function Customers() {
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading } = useGetCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  const summaryStats = [
    { label: 'Total Customers', value: totalCustomers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Today', value: '23', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Outstanding', value: `৳${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-primary', bg: 'bg-emerald-50' },
  ];

  const getAvatar = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={`flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer relationships and dues</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-semibold text-foreground transition-colors shadow-sm">
            <Upload className="w-4 h-4 text-primary" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-semibold text-foreground transition-colors shadow-sm">
            <Download className="w-4 h-4 text-primary" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-orange-600 text-primary-foreground text-sm font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} flex-shrink-0 shadow-inner`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-card-foreground leading-none mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex gap-6 min-h-0 relative">
        {/* Main List Area */}
        <div className="flex-1 bg-card rounded-2xl border border-card-border shadow-sm flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="p-4 border-b border-card-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-accent/30 rounded-t-2xl">
            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm font-semibold text-foreground outline-none w-full placeholder-muted-foreground"
                placeholder="Search name, email, phone..." 
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 shadow-sm text-sm font-semibold text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Last 30 Days</span>
              </div>
              <button className="flex items-center justify-center bg-primary hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-sm font-bold transition-colors shadow-sm">
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-card rounded-b-2xl">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-accent/50 sticky top-0 z-10 border-b border-card-border">
                <tr>
                  <th className="py-3 px-4 font-bold text-foreground">Customer</th>
                  <th className="py-3 px-4 font-bold text-foreground">Contact Info</th>
                  <th className="py-3 px-4 font-bold text-foreground">Group</th>
                  <th className="py-3 px-4 font-bold text-foreground text-right">Total Spent</th>
                  <th className="py-3 px-4 font-bold text-foreground text-right">Balance Due</th>
                  <th className="py-3 px-4 font-bold text-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c, i) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCustomer(selectedCustomer?.id === c.id ? null : c)}
                    className={`group cursor-pointer transition-colors ${
                      selectedCustomer?.id === c.id ? 'bg-primary/5' : 'hover:bg-accent/50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                          {getAvatar(c.name)}
                        </div>
                        <div>
                          <div className={`font-bold transition-colors ${selectedCustomer?.id === c.id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                            {c.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 font-medium">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {c.visits} visits
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 text-xs font-medium">
                        <div className="flex items-center gap-2 text-foreground"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{c.phone || '-'}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{c.email || '-'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${groupColors[c.group] ?? groupColors['Regular']}`}>{c.group}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-foreground">৳{c.totalPurchases.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${c.balance > 0 ? 'text-red-600 bg-red-50 px-2 py-1 rounded-md' : 'text-green-600'}`}>
                        ৳{c.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${c.status === 'Active' ? 'bg-green-500' : 'bg-muted-foreground'}`} title={c.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div 
              initial={{ opacity: 0, width: 0, x: 20 }}
              animate={{ opacity: 1, width: 320, x: 0 }}
              exit={{ opacity: 0, width: 0, x: 20 }}
              className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col flex-shrink-0 overflow-hidden"
            >
              <div className="p-6 bg-accent/30 border-b border-card-border relative text-center">
                <button 
                  onClick={() => setSelectedCustomer(null)} 
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-3xl font-display font-bold text-white shadow-md mb-4 ${avatarColors[customers.indexOf(selectedCustomer) % avatarColors.length]}`}>
                  {getAvatar(selectedCustomer.name)}
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mb-1">{selectedCustomer.name}</h2>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold shadow-sm ${groupColors[selectedCustomer.group] ?? groupColors['Regular']}`}>
                  {selectedCustomer.group} Customer
                </span>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Info</h3>
                  <div className="grid gap-3 text-sm font-medium">
                    <div className="flex items-center gap-3 text-foreground"><Phone className="w-4 h-4 text-primary" />{selectedCustomer.phone || '-'}</div>
                    <div className="flex items-center gap-3 text-foreground"><Mail className="w-4 h-4 text-primary" />{selectedCustomer.email || '-'}</div>
                    <div className="flex items-center gap-3 text-foreground"><MapPin className="w-4 h-4 text-primary" />{selectedCustomer.area || '-'}</div>
                    <div className="flex items-center gap-3 text-foreground"><Calendar className="w-4 h-4 text-primary" />Registered: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Financial Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
                      <div className="text-lg font-display font-bold text-foreground">৳{selectedCustomer.totalPurchases.toLocaleString()}</div>
                      <div className="text-xs font-semibold text-muted-foreground">Total Spent</div>
                    </div>
                    <div className={`border rounded-xl p-3 shadow-sm ${selectedCustomer.balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <div className={`text-lg font-display font-bold ${selectedCustomer.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        ৳{selectedCustomer.balance.toLocaleString()}
                      </div>
                      <div className={`text-xs font-semibold ${selectedCustomer.balance > 0 ? 'text-red-600/80' : 'text-green-600/80'}`}>Balance Due</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm col-span-2">
                      <div className="text-lg font-display font-bold text-amber-700">{selectedCustomer.visits}</div>
                      <div className="text-xs font-semibold text-amber-600/80">Total Visits</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button className="w-full py-3 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold transition-colors shadow-sm">
                    New Transaction
                  </button>
                  <button className="w-full py-3 rounded-xl bg-background border border-border text-foreground font-bold hover:bg-accent hover:border-primary/50 transition-colors shadow-sm">
                    View Purchase History
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
