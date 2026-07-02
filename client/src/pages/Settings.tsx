import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@/lib/api/custom-fetch';
import {
  Store, CreditCard, Receipt, Bell, Shield, Save, Percent, Check, AlertCircle
} from 'lucide-react';

const sections = [
  { id: 'store',        label: 'Store Info',      icon: Store,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'receipt',      label: 'Receipt',          icon: Receipt,  color: 'text-blue-600',    bg: 'bg-blue-50' },
  { id: 'payment',      label: 'Payment',          icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'tax',          label: 'Tax & Discount',   icon: Percent,  color: 'text-orange-600',  bg: 'bg-orange-50' },
  { id: 'notification', label: 'Notifications',    icon: Bell,     color: 'text-pink-600',    bg: 'bg-pink-50' },
  { id: 'security',     label: 'Security',         icon: Shield,   color: 'text-red-600',     bg: 'bg-red-50' },
];

const InputRow = ({ label, value, onChange, type = 'text', placeholder = '' }: any) => (
  <div>
    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
  </div>
);

const Toggle = ({ label, desc, value, onChange }: any) => (
  <div className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
    <div>
      <p className="text-sm font-bold text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!value)} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-border'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
);

type Settings = Record<string, any>;

export function Settings() {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState('store');
  const [local, setLocal] = useState<Settings>({});
  const [saveOk, setSaveOk] = useState(false);

  const { data: remote, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => customFetch<Settings>('/api/settings'),
  });

  useEffect(() => {
    if (remote) setLocal(remote);
  }, [remote]);

  const patch = useMutation({
    mutationFn: (updates: Settings) =>
      customFetch<Settings>('/api/settings', { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data);
      setLocal(data);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    },
  });

  const set = (key: string, val: any) => setLocal(s => ({ ...s, [key]: val }));

  const handleSave = () => patch.mutate(local);

  const renderSection = () => {
    if (isLoading) return (
      <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading settings…</span>
      </div>
    );

    switch (activeSection) {
      case 'store':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Store Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputRow label="Store Name" value={local.storeName} onChange={(v: string) => set('storeName', v)} />
              <InputRow label="Phone" type="tel" value={local.storePhone} onChange={(v: string) => set('storePhone', v)} />
              <InputRow label="Email" type="email" value={local.storeEmail} onChange={(v: string) => set('storeEmail', v)} />
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Currency</label>
                <select value={local.currencyCode ?? 'BDT'} onChange={e => { set('currencyCode', e.target.value); set('currency', e.target.value === 'BDT' ? '৳' : e.target.value === 'USD' ? '$' : '€'); }}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                  {[['BDT', 'Bangladeshi Taka (৳)'], ['USD', 'US Dollar ($)'], ['EUR', 'Euro (€)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Timezone</label>
                <select value={local.timezone ?? 'Asia/Dhaka'} onChange={e => set('timezone', e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                  {['Asia/Dhaka', 'Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Address</label>
                <textarea rows={2} value={local.storeAddress ?? ''} onChange={e => set('storeAddress', e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
              </div>
            </div>
          </div>
        );

      case 'receipt':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Receipt Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputRow label="Invoice Prefix" value={local.invoicePrefix} onChange={(v: string) => set('invoicePrefix', v)} placeholder="INV" />
              <InputRow label="Quotation Prefix" value={local.quotationPrefix} onChange={(v: string) => set('quotationPrefix', v)} placeholder="QT" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Receipt Footer Message</label>
              <textarea rows={2} value={local.receiptFooter ?? ''} onChange={e => set('receiptFooter', e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Payment Methods</h2>
            <p className="text-sm text-muted-foreground">Enable or disable payment methods available at checkout.</p>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              {[
                { key: 'paymentCash',   label: 'Cash',            desc: 'Physical currency' },
                { key: 'paymentCard',   label: 'Card',            desc: 'Debit / Credit card' },
                { key: 'paymentBkash',  label: 'bKash',           desc: 'Mobile financial service' },
                { key: 'paymentNagad',  label: 'Nagad',           desc: 'Mobile financial service' },
                { key: 'paymentCredit', label: 'Customer Credit', desc: 'Record as credit on account' },
                { key: 'paymentBank',   label: 'Bank Transfer',   desc: 'Direct bank payment' },
              ].map(({ key, label, desc }) => (
                <Toggle key={key} label={label} desc={desc} value={local[key] ?? (key === 'paymentCash')} onChange={(v: boolean) => set(key, v)} />
              ))}
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Tax & Discount</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Enable Tax" desc="Apply VAT/GST on sales" value={!!local.enableTax} onChange={(v: boolean) => set('enableTax', v)} />
              <Toggle label="Enable Discounts" desc="Allow cashiers to apply discounts" value={local.enableDiscount !== false} onChange={(v: boolean) => set('enableDiscount', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {local.enableTax && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Tax Rate (%)</label>
                  <input type="number" min="0" max="100" value={local.taxRate ?? 0} onChange={e => set('taxRate', Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Low Stock Threshold (units)</label>
                <input type="number" min="0" value={local.lowStockThreshold ?? 5} onChange={e => set('lowStockThreshold', Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Notifications</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Low Stock Alerts" desc="Alert when stock drops below threshold" value={local.notifLowStock !== false} onChange={(v: boolean) => set('notifLowStock', v)} />
              <Toggle label="Daily Summary" desc="End-of-day sales summary" value={local.notifDailySummary !== false} onChange={(v: boolean) => set('notifDailySummary', v)} />
              <Toggle label="New Sale Alerts" desc="Notify on each sale" value={!!local.notifNewSale} onChange={(v: boolean) => set('notifNewSale', v)} />
              <Toggle label="Email Notifications" desc="Send alerts to store email" value={!!local.notifEmail} onChange={(v: boolean) => set('notifEmail', v)} />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Security</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Require PIN at POS" desc="Staff must enter PIN before each sale" value={!!local.requirePin} onChange={(v: boolean) => set('requirePin', v)} />
              <Toggle label="Auto Logout" desc="Logout after inactivity" value={local.autoLogout !== false} onChange={(v: boolean) => set('autoLogout', v)} />
              <Toggle label="Two-Factor Authentication" desc="Extra login security for admin" value={!!local.twoFactor} onChange={(v: boolean) => set('twoFactor', v)} />
            </div>
            {local.autoLogout !== false && (
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Auto-logout after (minutes)</label>
                <select value={local.logoutMinutes ?? 30} onChange={e => set('logoutMinutes', Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors max-w-[200px]">
                  {[5, 15, 30, 60, 120].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your POS system preferences</p>
        </div>
        <button onClick={handleSave} disabled={patch.isPending}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 ${saveOk ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}>
          {patch.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : saveOk ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {patch.isPending ? 'Saving…' : saveOk ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {patch.isError && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4" /> Failed to save settings. Please try again.
        </div>
      )}

      <div className="flex-1 flex gap-5 min-h-0">
        <div className="w-56 flex-shrink-0">
          <nav className="bg-card border border-card-border rounded-2xl p-2 shadow-sm space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${activeSection === s.id ? 'bg-primary text-white shadow-sm' : 'text-foreground hover:bg-accent'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activeSection === s.id ? 'bg-white/20' : s.bg}`}>
                  <s.icon className={`w-4 h-4 ${activeSection === s.id ? 'text-white' : s.color}`} />
                </div>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-card border border-card-border rounded-2xl p-6 shadow-sm overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
