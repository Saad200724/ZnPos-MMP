import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@/lib/api/custom-fetch';
import {
  Store, CreditCard, Receipt, Bell, Shield, Save, Percent, Check,
  AlertCircle, KeyRound, Eye, EyeOff
} from 'lucide-react';

const sections = [
  { id: 'store',        label: 'Store Info',      icon: Store,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'receipt',      label: 'Receipt',          icon: Receipt,  color: 'text-blue-600',    bg: 'bg-blue-50' },
  { id: 'payment',      label: 'Payment',          icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'tax',          label: 'Tax & Discount',   icon: Percent,  color: 'text-orange-600',  bg: 'bg-orange-50' },
  { id: 'notification', label: 'Notifications',    icon: Bell,     color: 'text-pink-600',    bg: 'bg-pink-50' },
  { id: 'security',     label: 'Security',         icon: Shield,   color: 'text-red-600',     bg: 'bg-red-50' },
  { id: 'password',     label: 'Change Password',  icon: KeyRound, color: 'text-indigo-600',  bg: 'bg-indigo-50' },
];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

const TextInput = ({ value, onChange, type = 'text', placeholder = '' }: any) => (
  <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
);

const Toggle = ({ label, desc, value, onChange }: any) => (
  <div className="flex items-center justify-between py-3.5 border-b border-card-border last:border-0">
    <div>
      <p className="text-sm font-bold text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ml-4 ${value ? 'bg-primary' : 'bg-border'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
);

type S = Record<string, any>;

export function Settings() {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState('store');
  const [local, setLocal] = useState<S | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  // Change password state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState(false);

  const { data: remote, isLoading, isError } = useQuery<S>({
    queryKey: ['settings'],
    queryFn: () => customFetch<S>('/api/settings'),
    staleTime: 0,
  });

  useEffect(() => {
    if (remote && !local) setLocal(remote);
  }, [remote]);

  const saveMutation = useMutation({
    mutationFn: (updates: S) =>
      customFetch<S>('/api/settings', { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data);
      setLocal(data);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    },
  });

  const changePwMutation = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      customFetch<{ message: string }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setPwForm({ current: '', next: '', confirm: '' });
      setPwErr('');
      setPwOk(true);
      setTimeout(() => setPwOk(false), 3000);
    },
    onError: (e: any) => {
      setPwErr(e?.data?.error ?? e.message ?? 'Failed to change password');
    },
  });

  const set = (key: string, val: any) => setLocal(s => s ? { ...s, [key]: val } : s);

  const handleSave = () => {
    if (local) saveMutation.mutate(local);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr('');
    if (pwForm.next.length < 6) { setPwErr('New password must be at least 6 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwErr('New passwords do not match'); return; }
    changePwMutation.mutate({ currentPassword: pwForm.current, newPassword: pwForm.next });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading settings…</p>
      </div>
    </div>
  );

  if (isError || !local) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-bold text-foreground">Failed to load settings</p>
        <p className="text-sm text-muted-foreground mt-1">Check your connection and try again</p>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'store':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Store Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Store Name">
                <TextInput value={local.storeName} onChange={(v: string) => set('storeName', v)} placeholder="Meow Meow Pet Shop" />
              </Field>
              <Field label="Phone Number">
                <TextInput type="tel" value={local.storePhone} onChange={(v: string) => set('storePhone', v)} placeholder="+880 1234 567890" />
              </Field>
              <Field label="Email Address">
                <TextInput type="email" value={local.storeEmail} onChange={(v: string) => set('storeEmail', v)} placeholder="hello@shop.com" />
              </Field>
              <Field label="Currency">
                <select value={local.currencyCode ?? 'BDT'} onChange={e => {
                  set('currencyCode', e.target.value);
                  set('currency', e.target.value === 'BDT' ? '৳' : e.target.value === 'USD' ? '$' : '€');
                }} className={inputCls}>
                  <option value="BDT">Bangladeshi Taka (৳)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </Field>
              <Field label="Timezone">
                <select value={local.timezone ?? 'Asia/Dhaka'} onChange={e => set('timezone', e.target.value)} className={inputCls}>
                  {['Asia/Dhaka', 'Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'].map(tz =>
                    <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>
              <Field label="Address">
                <textarea rows={2} value={local.storeAddress ?? ''} onChange={e => set('storeAddress', e.target.value)}
                  placeholder="Street, City, Country"
                  className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        );

      case 'receipt':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Receipt Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Invoice Prefix">
                <TextInput value={local.invoicePrefix} onChange={(v: string) => set('invoicePrefix', v)} placeholder="INV" />
              </Field>
              <Field label="Quotation Prefix">
                <TextInput value={local.quotationPrefix} onChange={(v: string) => set('quotationPrefix', v)} placeholder="QT" />
              </Field>
            </div>
            <Field label="Receipt Footer Message">
              <textarea rows={3} value={local.receiptFooter ?? ''} onChange={e => set('receiptFooter', e.target.value)}
                placeholder="Thank you for shopping with us!"
                className={`${inputCls} resize-none`} />
            </Field>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Payment Methods</h2>
            <p className="text-sm text-muted-foreground">Enable or disable payment methods available at checkout.</p>
            <div className="bg-background border border-border rounded-xl p-4">
              {[
                { key: 'paymentCash',   label: 'Cash',            desc: 'Physical currency' },
                { key: 'paymentCard',   label: 'Card',            desc: 'Debit / Credit card (POS machine)' },
                { key: 'paymentBkash',  label: 'bKash',           desc: 'Mobile financial service' },
                { key: 'paymentNagad',  label: 'Nagad',           desc: 'Mobile financial service' },
                { key: 'paymentCredit', label: 'Customer Credit', desc: 'Record as credit on customer account' },
                { key: 'paymentBank',   label: 'Bank Transfer',   desc: 'Direct bank payment' },
              ].map(({ key, label, desc }) => (
                <Toggle key={key} label={label} desc={desc}
                  value={local[key] !== undefined ? local[key] : (key === 'paymentCash')}
                  onChange={(v: boolean) => set(key, v)} />
              ))}
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Tax & Discount</h2>
            <div className="bg-background border border-border rounded-xl p-4">
              <Toggle label="Enable Tax (VAT/GST)" desc="Apply tax automatically on every sale" value={!!local.enableTax} onChange={(v: boolean) => set('enableTax', v)} />
              <Toggle label="Enable Discounts" desc="Allow cashiers to apply discounts at checkout" value={local.enableDiscount !== false} onChange={(v: boolean) => set('enableDiscount', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {local.enableTax && (
                <Field label="Tax Rate (%)">
                  <input type="number" min="0" max="100" step="0.1" value={local.taxRate ?? 0}
                    onChange={e => set('taxRate', Number(e.target.value))} className={inputCls} />
                </Field>
              )}
              <Field label="Low Stock Alert Threshold (units)">
                <input type="number" min="0" value={local.lowStockThreshold ?? 5}
                  onChange={e => set('lowStockThreshold', Number(e.target.value))} className={inputCls} />
              </Field>
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Notifications</h2>
            <div className="bg-background border border-border rounded-xl p-4">
              <Toggle label="Low Stock Alerts" desc="Alert when product stock drops below threshold" value={local.notifLowStock !== false} onChange={(v: boolean) => set('notifLowStock', v)} />
              <Toggle label="Daily Sales Summary" desc="End-of-day report notification" value={local.notifDailySummary !== false} onChange={(v: boolean) => set('notifDailySummary', v)} />
              <Toggle label="New Sale Alerts" desc="Notify on each completed sale" value={!!local.notifNewSale} onChange={(v: boolean) => set('notifNewSale', v)} />
              <Toggle label="Email Notifications" desc="Send alert emails to the store email address" value={!!local.notifEmail} onChange={(v: boolean) => set('notifEmail', v)} />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Security</h2>
            <div className="bg-background border border-border rounded-xl p-4">
              <Toggle label="Require PIN at POS" desc="Staff must enter their PIN before processing each sale" value={!!local.requirePin} onChange={(v: boolean) => set('requirePin', v)} />
              <Toggle label="Auto Logout" desc="Automatically log out after a period of inactivity" value={local.autoLogout !== false} onChange={(v: boolean) => set('autoLogout', v)} />
            </div>
            {local.autoLogout !== false && (
              <Field label="Auto-logout after (minutes)">
                <select value={local.logoutMinutes ?? 30} onChange={e => set('logoutMinutes', Number(e.target.value))} className={`${inputCls} max-w-[200px]`}>
                  {[5, 15, 30, 60, 120].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </Field>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-lg text-card-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground">Update the password for your current login account.</p>

            <AnimatePresence>
              {pwOk && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
                  <Check className="w-4 h-4" /> Password changed successfully!
                </motion.div>
              )}
              {pwErr && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
                  <AlertCircle className="w-4 h-4" /> {pwErr}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {([
                ['current', 'Current Password', 'Enter your current password'],
                ['next',    'New Password',      'At least 6 characters'],
                ['confirm', 'Confirm New Password', 'Re-enter new password'],
              ] as const).map(([key, label, placeholder]) => (
                <Field key={key} label={label}>
                  <div className="relative">
                    <input
                      type={pwShow[key] ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={e => { setPwErr(''); setPwForm(f => ({ ...f, [key]: e.target.value })); }}
                      placeholder={placeholder}
                      required
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" onClick={() => setPwShow(s => ({ ...s, [key]: !s[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {pwShow[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              ))}
              <button type="submit" disabled={changePwMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60">
                {changePwMutation.isPending
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Changing…</>
                  : <><KeyRound className="w-4 h-4" /> Change Password</>}
              </button>
            </form>
          </div>
        );

      default: return null;
    }
  };

  const isPasswordSection = activeSection === 'password';

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your POS system preferences</p>
        </div>
        {!isPasswordSection && (
          <button onClick={handleSave} disabled={saveMutation.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 ${saveOk ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}>
            {saveMutation.isPending
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              : saveOk
              ? <><Check className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        )}
      </div>

      {saveMutation.isError && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4" /> Failed to save. Please try again.
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
