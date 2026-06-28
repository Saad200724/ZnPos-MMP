import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Store, CreditCard, Receipt, Bell, Shield,
  ChevronRight, Save, Globe, Palette, Database, Printer, Check, X,
  DollarSign, Phone, Mail, MapPin, Hash, Percent
} from 'lucide-react';

const sections = [
  { id: 'store', label: 'Store Info', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'receipt', label: 'Receipt', icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'payment', label: 'Payment', icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'tax', label: 'Tax & Discount', icon: Percent, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'notification', label: 'Notifications', icon: Bell, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'security', label: 'Security', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
];

const InputRow = ({ label, value, onChange, type = 'text', placeholder = '' }: any) => (
  <div>
    <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
  </div>
);

const Toggle = ({ label, desc, value, onChange }: any) => (
  <div className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
    <div>
      <p className="text-sm font-bold text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-border'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
);

export function Settings() {
  const [activeSection, setActiveSection] = useState('store');
  const [saved, setSaved] = useState(false);

  const [store, setStore] = useState({
    name: 'Mew Mew Pet Shop', phone: '+880 1234 567890', email: 'hello@mewmew.shop',
    address: 'Gulshan-1, Dhaka, Bangladesh', currency: 'BDT', language: 'en',
  });

  const [receipt, setReceipt] = useState({
    showLogo: true, showAddress: true, showPhone: true,
    footer: 'Thank you for shopping at Mew Mew!', copies: 1,
  });

  const [payment, setPayment] = useState({
    cash: true, card: true, bkash: true, nagad: true, credit: true, bank: false,
  });

  const [tax, setTax] = useState({
    taxEnabled: false, taxRate: 15, discountEnabled: true, maxDiscount: 30,
  });

  const [notif, setNotif] = useState({
    lowStock: true, dailySummary: true, newSale: false, email: false,
  });

  const [security, setSecurity] = useState({
    requirePin: false, autoLogout: true, logoutMinutes: 30, twoFactor: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'store':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Store Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputRow label="Store Name" value={store.name} onChange={(v: string) => setStore(s => ({ ...s, name: v }))} />
              <InputRow label="Phone" type="tel" value={store.phone} onChange={(v: string) => setStore(s => ({ ...s, phone: v }))} />
              <InputRow label="Email" type="email" value={store.email} onChange={(v: string) => setStore(s => ({ ...s, email: v }))} />
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Currency</label>
                <select value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                  {[['BDT', 'Bangladeshi Taka (৳)'], ['USD', 'US Dollar ($)'], ['EUR', 'Euro (€)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Address</label>
                <textarea rows={2} value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors resize-none" />
              </div>
            </div>
          </div>
        );

      case 'receipt':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Receipt Settings</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Show Store Logo" desc="Print logo on receipts" value={receipt.showLogo} onChange={(v: boolean) => setReceipt(r => ({ ...r, showLogo: v }))} />
              <Toggle label="Show Address" value={receipt.showAddress} onChange={(v: boolean) => setReceipt(r => ({ ...r, showAddress: v }))} />
              <Toggle label="Show Phone Number" value={receipt.showPhone} onChange={(v: boolean) => setReceipt(r => ({ ...r, showPhone: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Receipt Copies</label>
                <select value={receipt.copies} onChange={e => setReceipt(r => ({ ...r, copies: Number(e.target.value) }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors">
                  {[1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 1 ? 'copy' : 'copies'}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Receipt Footer Message</label>
              <textarea rows={2} value={receipt.footer} onChange={e => setReceipt(r => ({ ...r, footer: e.target.value }))}
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
                { key: 'cash', label: 'Cash', desc: 'Physical currency' },
                { key: 'card', label: 'Card', desc: 'Debit / Credit card' },
                { key: 'bkash', label: 'bKash', desc: 'Mobile financial service' },
                { key: 'nagad', label: 'Nagad', desc: 'Mobile financial service' },
                { key: 'credit', label: 'Customer Credit', desc: 'Record as credit on account' },
                { key: 'bank', label: 'Bank Transfer', desc: 'Direct bank payment' },
              ].map(({ key, label, desc }) => (
                <Toggle key={key} label={label} desc={desc} value={(payment as any)[key]} onChange={(v: boolean) => setPayment(p => ({ ...p, [key]: v }))} />
              ))}
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Tax & Discount</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Enable Tax" desc="Apply VAT/GST on sales" value={tax.taxEnabled} onChange={(v: boolean) => setTax(t => ({ ...t, taxEnabled: v }))} />
              <Toggle label="Enable Discounts" desc="Allow cashiers to apply discounts" value={tax.discountEnabled} onChange={(v: boolean) => setTax(t => ({ ...t, discountEnabled: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {tax.taxEnabled && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Tax Rate (%)</label>
                  <input type="number" min="0" max="100" value={tax.taxRate} onChange={e => setTax(t => ({ ...t, taxRate: Number(e.target.value) }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                </div>
              )}
              {tax.discountEnabled && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Max Discount (%)</label>
                  <input type="number" min="0" max="100" value={tax.maxDiscount} onChange={e => setTax(t => ({ ...t, maxDiscount: Number(e.target.value) }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors" />
                </div>
              )}
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Notifications</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Low Stock Alerts" desc="Alert when stock drops below minimum" value={notif.lowStock} onChange={(v: boolean) => setNotif(n => ({ ...n, lowStock: v }))} />
              <Toggle label="Daily Summary" desc="End-of-day sales summary" value={notif.dailySummary} onChange={(v: boolean) => setNotif(n => ({ ...n, dailySummary: v }))} />
              <Toggle label="New Sale Alerts" desc="Notify on each sale" value={notif.newSale} onChange={(v: boolean) => setNotif(n => ({ ...n, newSale: v }))} />
              <Toggle label="Email Notifications" desc="Send alerts to store email" value={notif.email} onChange={(v: boolean) => setNotif(n => ({ ...n, email: v }))} />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-card-foreground">Security</h2>
            <div className="bg-background border border-border rounded-xl p-4 divide-y divide-border">
              <Toggle label="Require PIN at POS" desc="Staff must enter PIN before each sale" value={security.requirePin} onChange={(v: boolean) => setSecurity(s => ({ ...s, requirePin: v }))} />
              <Toggle label="Auto Logout" desc="Logout after inactivity" value={security.autoLogout} onChange={(v: boolean) => setSecurity(s => ({ ...s, autoLogout: v }))} />
              <Toggle label="Two-Factor Authentication" desc="Extra login security for admin" value={security.twoFactor} onChange={(v: boolean) => setSecurity(s => ({ ...s, twoFactor: v }))} />
            </div>
            {security.autoLogout && (
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Auto-logout after (minutes)</label>
                <select value={security.logoutMinutes} onChange={e => setSecurity(s => ({ ...s, logoutMinutes: Number(e.target.value) }))}
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
        <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 ${saved ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}>
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

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
