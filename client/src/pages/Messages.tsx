import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Bell, AlertTriangle, CheckCircle, Package2,
  ShoppingCart, DollarSign, Users, X, Check, CheckCheck, Clock
} from 'lucide-react';

interface Notification {
  id: number; type: 'alert' | 'success' | 'warning' | 'info'; title: string;
  body: string; time: string; read: boolean; icon: any; color: string; bg: string;
}

const now = Date.now();

const initialNotifs: Notification[] = [
  { id: 1, type: 'warning', title: 'Low Stock Alert', body: 'Royal Canin Kitten 2kg is running low — only 3 units left.', time: new Date(now - 5 * 60000).toISOString(), read: false, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { id: 2, type: 'success', title: 'Daily Target Reached', body: "Congratulations! Today's sales target of ৳50,000 has been achieved.", time: new Date(now - 15 * 60000).toISOString(), read: false, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 3, type: 'alert', title: 'Out of Stock', body: 'Whiskas Ocean Fish (400g) is completely out of stock.', time: new Date(now - 45 * 60000).toISOString(), read: false, icon: Package2, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { id: 4, type: 'info', title: 'New Customer Registered', body: 'Rashida Begum has been added as a new VIP customer.', time: new Date(now - 2 * 3600000).toISOString(), read: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { id: 5, type: 'success', title: 'Purchase Order Received', body: 'PO-0045 from Apex Pet Supplies has been marked as received.', time: new Date(now - 3 * 3600000).toISOString(), read: true, icon: ShoppingCart, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { id: 6, type: 'warning', title: 'Customer Due Reminder', body: 'Kamal Hossain has an outstanding balance of ৳12,500 for over 30 days.', time: new Date(now - 5 * 3600000).toISOString(), read: true, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { id: 7, type: 'info', title: 'Monthly Report Ready', body: "June 2026's performance report is ready for your review.", time: new Date(now - 24 * 3600000).toISOString(), read: true, icon: CheckCircle, color: 'text-primary', bg: 'bg-orange-50 border-orange-200' },
  { id: 8, type: 'alert', title: 'Low Stock Alert', body: 'Pedigree Adult Chicken 3kg — only 2 units remaining.', time: new Date(now - 26 * 3600000).toISOString(), read: true, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
];

const fmtTime = (s: string) => {
  const mins = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

export function Messages() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifs);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alert' | 'success' | 'warning' | 'info'>('all');

  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const filters = [
    { label: 'All', value: 'all' as const },
    { label: `Unread (${unreadCount})`, value: 'unread' as const },
    { label: 'Alerts', value: 'alert' as const },
    { label: 'Warnings', value: 'warning' as const },
    { label: 'Success', value: 'success' as const },
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">{unreadCount}</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">System alerts, stock updates, and reminders</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-card-border text-sm font-bold text-foreground hover:bg-accent shadow-sm transition-colors">
            <CheckCheck className="w-4 h-4 text-primary" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f.value ? 'bg-primary text-white shadow-sm' : 'bg-card border border-card-border text-foreground hover:bg-accent'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">No notifications in this category</p>
            </motion.div>
          ) : filtered.map((notif, i) => (
            <motion.div key={notif.id} layout initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95, height: 0 }}
              transition={{ delay: Math.min(i, 15) * 0.03, type: 'spring', stiffness: 300, damping: 26 }}
              onClick={() => markRead(notif.id)}
              className={`bg-card border rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md group ${!notif.read ? 'border-primary/20 bg-primary/[0.02]' : 'border-card-border'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${notif.bg}`}>
                  <notif.icon className={`w-5 h-5 ${notif.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</h3>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />{fmtTime(notif.time)}
                      </span>
                      <button onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                        className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm mt-0.5 leading-relaxed ${notif.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>{notif.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
