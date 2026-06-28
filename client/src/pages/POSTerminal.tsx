import { useState, useRef, useEffect } from 'react';
import {
  Search, X, Plus, Minus, CreditCard, Banknote, Smartphone,
  ScanLine, ShoppingCart, Percent, User, Package, Check,
  Cookie, Droplets, Pill, Scissors, Wind, ChevronDown,
  RefreshCw, PauseCircle, Trash2, DollarSign, BarChart2,
  Tag, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProducts, useCreateTransaction, getGetDashboardStatsQueryKey, getGetProductsQueryKey } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/lib/api';

const categories = ['All', 'Dry Food', 'Wet Food', 'Treats', 'Supplements', 'Accessories'];

const categoryConfig: Record<string, { bg: string; iconBg: string; accent: string; icon: React.FC<{ className?: string }> }> = {
  'Dry Food':    { bg: '#FEF3C7', iconBg: '#FDE68A', accent: '#D97706', icon: Wind },
  'Wet Food':    { bg: '#DBEAFE', iconBg: '#BFDBFE', accent: '#2563EB', icon: Droplets },
  'Treats':      { bg: '#FEF9C3', iconBg: '#FEF08A', accent: '#CA8A04', icon: Cookie },
  'Supplements': { bg: '#DCFCE7', iconBg: '#BBF7D0', accent: '#16A34A', icon: Pill },
  'Accessories': { bg: '#FCE7F3', iconBg: '#FBCFE8', accent: '#DB2777', icon: Scissors },
};
const defaultConfig = { bg: '#F3F4F6', iconBg: '#E5E7EB', accent: '#6B7280', icon: Package };

type CartItem = {
  id: number; name: string; brand: string; sku: string;
  price: number; qty: number; disc: number;
};

const VAT_RATE = 0;

export function POSTerminal() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState('Walk-in Customer');
  const [discountPct, setDiscountPct] = useState(0);
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [exchange, setExchange] = useState(0);
  const [onHold, setOnHold] = useState<CartItem[] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useGetProducts();
  const queryClient = useQueryClient();
  const createTransactionMutation = useCreateTransaction();

  const filtered = products.filter(p =>
    p.active !== false &&
    (activeCategory === 'All' || p.category === activeCategory) &&
    (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    )
  );

  const addToCart = (p: Product) => {
    if (paid) { setPaid(false); setCart([]); }
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, brand: p.brand, sku: p.sku, price: p.price, qty: 1, disc: 0 }];
    });
  };

  const updateQty = (id: number, delta: number) =>
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));

  const updateDisc = (id: number, val: number) =>
    setCart(prev => prev.map(c => c.id === id ? { ...c, disc: Math.min(100, Math.max(0, val)) } : c));

  const removeItem = (id: number) => setCart(prev => prev.filter(c => c.id !== id));

  const clearCart = () => { setCart([]); setDiscountPct(0); setPaymentMethod(null); setExchange(0); setPaid(false); };

  const holdCart = () => { setOnHold(cart); clearCart(); };
  const resumeHeld = () => { if (onHold) { setCart(onHold); setOnHold(null); } };

  // Per-item calculations
  const lineData = cart.map(c => {
    const discAmt = (c.price * c.disc) / 100;
    const afterDisc = (c.price - discAmt) * c.qty;
    return { ...c, discAmt: discAmt * c.qty, afterDisc };
  });

  const subtotal = lineData.reduce((s, l) => s + l.price * l.qty, 0);
  const totalDiscAmt = lineData.reduce((s, l) => s + l.discAmt, 0);
  const afterDiscSubtotal = lineData.reduce((s, l) => s + l.afterDisc, 0);
  const globalDisc = afterDiscSubtotal * (discountPct / 100);
  const afterAllDisc = afterDiscSubtotal - globalDisc;
  const vat = afterAllDisc * (VAT_RATE / 100);
  const total = afterAllDisc + vat;
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const exchangeTotal = Math.max(0, exchange - total);

  const handlePayment = () => {
    if (cart.length === 0 || !paymentMethod) return;
    createTransactionMutation.mutate({
      data: {
        customerName: customer,
        items: cart.map(item => {
          const prod = products.find((p: Product) => p.id === item.id);
          return {
            productId: item.id,
            productName: item.name,
            productBrand: item.brand,
            sku: prod?.sku ?? item.sku,
            price: item.price,
            qty: item.qty,
            lineTotal: item.price * item.qty,
          };
        }),
        subtotal,
        discountPct,
        discountAmt: globalDisc + totalDiscAmt,
        tax: vat,
        total,
        paymentMethod,
      }
    }, {
      onSuccess: () => {
        setPaid(true);
        queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        setTimeout(() => { clearCart(); }, 3200);
      }
    });
  };

  // Focus search on mount
  useEffect(() => { searchRef.current?.focus(); }, []);

  /* ─── Right panel ─────────────────────────────────────────────────── */
  const RightPanel = () => (
    <div className="flex flex-col h-full">

      {/* ── Top bar: customer + search ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-border space-y-2.5 bg-card">
        {/* Customer row */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 flex-1 bg-accent/60 hover:bg-accent border border-border rounded-xl px-3 py-2 transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold text-card-foreground flex-1 text-left truncate">{customer}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {onHold && (
            <button onClick={resumeHeld}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-colors cursor-pointer flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> Resume Hold
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-accent/60 border border-border rounded-xl px-3 py-2 focus-within:bg-background focus-within:border-primary transition-all duration-200">
          <ScanLine className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Enter Product Name / Scan Barcode / SKU"
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Cart Table ── */}
      <div className="flex-1 overflow-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center">
              <p className="font-bold text-card-foreground text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Click a product to add it</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white sticky top-0 z-10">
                <th className="text-left py-2.5 px-3 font-bold text-[11px] tracking-wide w-[38%]">Name</th>
                <th className="text-right py-2.5 px-2 font-bold text-[11px] tracking-wide">Price</th>
                <th className="text-center py-2.5 px-2 font-bold text-[11px] tracking-wide">Disc%</th>
                <th className="text-right py-2.5 px-2 font-bold text-[11px] tracking-wide">Disc Amt</th>
                <th className="text-right py-2.5 px-2 font-bold text-[11px] tracking-wide">After Disc</th>
                <th className="text-center py-2.5 px-2 font-bold text-[11px] tracking-wide">Qty</th>
                <th className="text-right py-2.5 px-3 font-bold text-[11px] tracking-wide">Total</th>
                <th className="py-2.5 px-1 w-6" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {lineData.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`border-b border-border/60 hover:bg-primary/5 transition-colors group ${i % 2 === 0 ? 'bg-card' : 'bg-accent/20'}`}
                  >
                    {/* Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-card-foreground leading-tight truncate max-w-[160px]">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{item.brand}</div>
                    </td>
                    {/* Price */}
                    <td className="py-2.5 px-2 text-right font-semibold text-card-foreground whitespace-nowrap">
                      ৳{item.price.toFixed(2)}
                    </td>
                    {/* Disc% */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          value={item.disc}
                          onChange={e => updateDisc(item.id, Number(e.target.value))}
                          className="w-10 text-center text-xs font-bold bg-accent/80 border border-border rounded-md py-0.5 outline-none focus:border-primary transition-colors text-foreground"
                          min={0} max={100}
                        />
                        <span className="text-muted-foreground ml-0.5">%</span>
                      </div>
                    </td>
                    {/* Disc Amt */}
                    <td className="py-2.5 px-2 text-right text-emerald-600 font-semibold whitespace-nowrap">
                      {item.discAmt > 0 ? `-৳${item.discAmt.toFixed(2)}` : '—'}
                    </td>
                    {/* After Disc */}
                    <td className="py-2.5 px-2 text-right font-semibold text-card-foreground whitespace-nowrap">
                      ৳{item.afterDisc.toFixed(2)}
                    </td>
                    {/* Qty */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center bg-accent border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer text-muted-foreground">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-extrabold text-sm text-card-foreground">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center bg-accent border border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all cursor-pointer text-muted-foreground">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    {/* Total */}
                    <td className="py-2.5 px-3 text-right font-extrabold text-primary whitespace-nowrap">
                      ৳{item.afterDisc.toFixed(2)}
                    </td>
                    {/* Remove */}
                    <td className="py-2.5 px-1">
                      <button onClick={() => removeItem(item.id)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* ── Summary Panel ── */}
      <div className="flex-shrink-0 border-t border-border bg-card">
        {/* Summary grid */}
        <div className="grid grid-cols-2 border-b border-border">
          {/* Left column */}
          <div className="divide-y divide-border/60">
            <SummaryRow label="Items" value={cart.length.toString()} />
            <SummaryRow label="Quantity" value={totalItems.toString()} />
            <SummaryRow label={`Total Vat (${VAT_RATE}%)`} value={`৳ ${vat.toFixed(2)}`} />
            <SummaryRow label="Exchange Total" value={`৳ ${exchangeTotal.toFixed(2)}`} accent />
          </div>
          {/* Right column */}
          <div className="divide-y divide-border/60 border-l border-border">
            <SummaryRow label="Total" value={`৳ ${subtotal.toFixed(2)}`} />
            <SummaryRow label="Discount" value={`-৳ ${(totalDiscAmt + globalDisc).toFixed(2)}`} />
            <SummaryRow label="After Discount Price" value={`৳ ${afterAllDisc.toFixed(2)}`} />
            <SummaryRow label="Payable" value={`৳ ${total.toFixed(2)}`} bold accent />
          </div>
        </div>

        {/* Exchange input + payment methods */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
          {/* Exchange received */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Exchange ৳</span>
            <input
              type="number"
              value={exchange || ''}
              onChange={e => setExchange(Math.max(0, Number(e.target.value)))}
              placeholder="0.00"
              className="flex-1 min-w-0 bg-accent/60 border border-border rounded-lg px-2.5 py-1.5 text-sm font-bold text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          {/* Payment method pills */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'Cash',   icon: Banknote,   color: 'emerald' },
              { id: 'Card',   icon: CreditCard, color: 'blue' },
              { id: 'MFS',    icon: Smartphone, color: 'purple' },
            ].map(m => {
              const active = paymentMethod === m.id;
              const colorMap: Record<string, string> = {
                emerald: active ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
                blue:    active ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'         : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                purple:  active ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-200'   : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
              };
              return (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} disabled={cart.length === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0 ${colorMap[m.color]} ${cart.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <m.icon className="w-3.5 h-3.5" />
                  {m.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons row */}
        <div className="px-4 py-3 flex items-stretch gap-2">
          {/* Total display */}
          <div className="flex-1 flex flex-col justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl px-4 py-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</div>
            <div className="text-xl font-extrabold font-display leading-tight">৳ {total.toFixed(2)}</div>
          </div>

          {/* Hold */}
          <button onClick={holdCart} disabled={cart.length === 0}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all duration-200 cursor-pointer shadow-md shadow-amber-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-w-[60px]">
            <PauseCircle className="w-4 h-4" />
            Hold
          </button>

          {/* Clear */}
          <button onClick={clearCart} disabled={cart.length === 0}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all duration-200 cursor-pointer shadow-md shadow-rose-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-w-[60px]">
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          {/* Payment */}
          <button onClick={handlePayment}
            disabled={cart.length === 0 || !paymentMethod || paid || createTransactionMutation.isPending}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl font-bold text-xs text-white transition-all duration-200 cursor-pointer shadow-md active:scale-95 min-w-[70px] ${
              paid
                ? 'bg-emerald-400 shadow-emerald-200'
                : cart.length > 0 && paymentMethod
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}>
            {paid ? <Check className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
            {paid ? 'Done!' : createTransactionMutation.isPending ? '...' : 'Payment'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── Main layout ─────────────────────────────────────────────────── */
  return (
    <div className={`flex h-full overflow-hidden bg-accent/20 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>

      {/* ── Left: Product Grid ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Category tabs */}
        <div className="flex-shrink-0 bg-card border-b border-border px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
          {categories.map(cat => {
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 border cursor-pointer ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/30 hover:bg-accent hover:text-foreground'
                }`}>
                {cat}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {/* Mobile cart button */}
            <button
              className="lg:hidden relative p-2 border border-border rounded-xl bg-card hover:bg-accent transition-all cursor-pointer"
              onClick={() => setShowMobileCart(true)}>
              <ShoppingCart className="w-4 h-4 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <span className="hidden sm:inline-flex text-xs text-muted-foreground font-medium">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <Package className="w-12 h-12 opacity-20" />
              <p className="text-sm font-semibold">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              <AnimatePresence>
                {filtered.map(p => {
                  const cartItem = cart.find(c => c.id === p.id);
                  const cfg = categoryConfig[p.category] ?? defaultConfig;
                  const CatIcon = cfg.icon;
                  const outOfStock = p.stock === 0;

                  return (
                    <motion.button
                      layout
                      key={p.id}
                      onClick={() => !outOfStock && addToCart(p)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.16, type: 'spring', stiffness: 280, damping: 24 }}
                      className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-card flex flex-col group cursor-pointer clay-btn ${
                        cartItem
                          ? 'border-primary ring-2 ring-primary/15 shadow-lg shadow-primary/10'
                          : outOfStock
                            ? 'border-border opacity-50 cursor-not-allowed'
                            : 'border-border/70 hover:border-primary/50 hover:shadow-md hover:shadow-primary/8'
                      }`}
                    >
                      {/* Cart qty badge */}
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center shadow-md ring-2 ring-white">
                          {cartItem.qty}
                        </motion.div>
                      )}

                      {/* Out of stock badge */}
                      {outOfStock && (
                        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-extrabold border border-red-200">
                          Out
                        </div>
                      )}

                      {/* Image / icon area */}
                      <div
                        className="w-full aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
                        style={{ background: cfg.bg }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: cfg.iconBg }}>
                          <CatIcon className="w-7 h-7" style={{ color: cfg.accent }} />
                        </div>
                        {/* Stock indicator strip */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${outOfStock ? 'bg-red-400' : p.stock <= (p.minStock ?? 5) ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      </div>

                      {/* Info */}
                      <div className="p-2.5 flex flex-col flex-1">
                        <div className="text-[10px] font-semibold text-muted-foreground truncate mb-0.5">{p.brand || p.category}</div>
                        <div className="text-xs font-extrabold text-card-foreground leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {p.name}
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <div className="text-sm font-extrabold text-primary font-display">৳{p.price.toFixed(0)}</div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            outOfStock ? 'bg-red-100 text-red-600' :
                            p.stock <= (p.minStock ?? 5) ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {outOfStock ? '0' : p.stock}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop Right Panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[480px] xl:w-[520px] border-l border-border flex-col bg-card shadow-[-4px_0_24px_-4px_rgba(0,0,0,0.08)] z-20">
        <RightPanel />
      </div>

      {/* ── Mobile Cart Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobileCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileCart(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-card shadow-2xl z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-display font-bold text-base">Current Order</span>
                <button onClick={() => setShowMobileCart(false)} className="p-1.5 rounded-xl hover:bg-accent cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <RightPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Helper ─────────────────────────────────────────────────────────────── */
function SummaryRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 ${accent ? 'bg-primary/5' : ''}`}>
      <span className={`text-[11px] ${bold ? 'font-extrabold text-foreground' : 'text-muted-foreground font-medium'}`}>{label}</span>
      <span className={`text-[11px] font-extrabold tabular-nums ${accent ? 'text-primary' : 'text-card-foreground'}`}>{value}</span>
    </div>
  );
}
