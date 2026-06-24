import { useState } from 'react';
import { 
  Search, X, Plus, Minus, CreditCard, Banknote, Smartphone,
  BarChart2, ChevronDown, ShoppingCart, Percent, User, Package, Check,
  Cookie, Droplets, Pill, Scissors, Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProducts, useCreateTransaction, getGetDashboardStatsQueryKey, getGetProductsQueryKey } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/lib/api';

const categories = ['All', 'Dry Food', 'Wet Food', 'Treats', 'Supplements', 'Accessories'];

const categoryConfig: Record<string, { bg: string; iconBg: string; icon: React.FC<{ className?: string }> }> = {
  'Dry Food':     { bg: '#FEF3C7', iconBg: '#FDE68A', icon: Wind },
  'Wet Food':     { bg: '#DBEAFE', iconBg: '#BFDBFE', icon: Droplets },
  'Treats':       { bg: '#FEF9C3', iconBg: '#FEF08A', icon: Cookie },
  'Supplements':  { bg: '#DCFCE7', iconBg: '#BBF7D0', icon: Pill },
  'Accessories':  { bg: '#FCE7F3', iconBg: '#FBCFE8', icon: Scissors },
};

const defaultConfig = { bg: '#F3F4F6', iconBg: '#E5E7EB', icon: Package };

type CartItem = { id: number; name: string; brand: string; price: number; qty: number; disc: number };

export function POSTerminal() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState('Walk-in Customer');
  const [discountPct, setDiscountPct] = useState(0);
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const { data: products = [], isLoading } = useGetProducts();
  const queryClient = useQueryClient();
  const createTransactionMutation = useCreateTransaction();

  const filtered = products.filter(p =>
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (p: Product) => {
    if (paid) {
      setPaid(false);
      setCart([]);
    }
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, brand: p.brand, price: p.price, qty: 1, disc: 0 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const removeItem = (id: number) => setCart(prev => prev.filter(c => c.id !== id));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = subtotal * (discountPct / 100);
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const handlePayment = () => {
    if (cart.length === 0 || !paymentMethod) return;
    createTransactionMutation.mutate({
      data: {
        customerName: customer,
        items: cart.map(item => {
          const product = products.find((p: Product) => p.id === item.id);
          return {
            productId: item.id,
            productName: item.name,
            productBrand: item.brand,
            sku: product?.sku ?? '',
            price: item.price,
            qty: item.qty,
            lineTotal: item.price * item.qty,
          };
        }),
        subtotal,
        discountPct,
        discountAmt: discount,
        tax,
        total,
        paymentMethod,
      }
    }, {
      onSuccess: () => {
        setPaid(true);
        queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        setTimeout(() => {
          setPaid(false);
          setCart([]);
          setDiscountPct(0);
          setPaymentMethod(null);
        }, 3000);
      }
    });
  };

  const CartContent = () => (
    <>
      <div className="px-4 py-4 border-b border-border bg-card flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-card-foreground text-lg">Current Order</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground bg-accent border border-border px-2.5 py-1 rounded-lg">{totalItems} items</span>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-sm text-destructive hover:text-red-700 font-bold transition-colors cursor-pointer">Clear</button>
          )}
          <button className="lg:hidden p-1 text-muted-foreground cursor-pointer" onClick={() => setShowMobileCart(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-card">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-display font-bold text-lg text-card-foreground">Cart is empty</p>
            <p className="text-sm mt-2 font-medium">Click products on the left to add them.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {cart.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 hover:bg-accent transition-colors bg-card"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-card-foreground leading-tight truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-medium">{item.brand}</div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-0.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150 cursor-pointer">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-8 text-center text-card-foreground">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-150 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-card-foreground">৳{(item.price * item.qty).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">৳{item.price.toFixed(2)} / ea</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card p-4 flex-shrink-0 z-10 shadow-[0_-4px_12px_-3px_rgba(0,0,0,0.08)]">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold text-card-foreground">৳{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Discount</span>
              <div className="flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1 focus-within:border-primary transition-colors">
                <Percent className="w-3 h-3 text-muted-foreground" />
                <input 
                  type="number" 
                  value={discountPct} 
                  onChange={e => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-8 text-xs outline-none text-foreground bg-transparent font-bold" 
                  min={0} max={100} 
                  disabled={cart.length === 0}
                />
              </div>
            </div>
            <span className="font-semibold text-emerald-600">-৳{discount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Tax (8%)</span>
            <span className="font-semibold text-card-foreground">৳{tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
            <span className="text-lg font-display font-bold text-card-foreground">Total</span>
            <span className="text-2xl font-display font-bold text-primary">৳{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'cash',    icon: Banknote,    label: 'Cash',    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { id: 'card',    icon: CreditCard,  label: 'Card',    color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
            { id: 'digital', icon: Smartphone,  label: 'Digital', color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
          ].map(method => (
            <button 
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              disabled={cart.length === 0}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                paymentMethod === method.id 
                  ? `${method.border} ${method.bg} shadow-sm scale-[1.02]` 
                  : 'border-border bg-background hover:border-primary/40 hover:bg-accent'
              } ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <method.icon className={`w-5 h-5 ${method.color}`} />
              <span className="text-xs font-bold text-card-foreground">{method.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={handlePayment}
          disabled={cart.length === 0 || !paymentMethod || paid || createTransactionMutation.isPending}
          className={`clay-btn w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            paid 
              ? 'bg-emerald-500 scale-[0.98]' 
              : cart.length > 0 && paymentMethod 
                ? 'bg-primary hover:bg-emerald-700 hover:shadow-lg active:scale-[0.97]' 
                : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
          }`}
        >
          {paid ? (
            <><Check className="w-6 h-6" /> Payment Successful!</>
          ) : (
            createTransactionMutation.isPending ? 'Processing...' : `Charge ৳${total.toFixed(2)}`
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className={`flex h-full overflow-hidden bg-background ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Left: Product Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="bg-card border-b border-border p-4 flex flex-col sm:flex-row gap-3 z-10 shadow-sm">
          <div className="flex-1 flex items-center gap-3 bg-accent border border-border rounded-2xl px-4 py-2.5 focus-within:bg-background focus-within:border-primary transition-all duration-200">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground outline-none flex-1 placeholder-muted-foreground"
              placeholder="Search product name, brand, or SKU..." 
            />
            <button className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer" title="Scan Barcode">
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-start gap-3 border border-border rounded-2xl px-4 py-2.5 bg-card hover:bg-accent transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-card-foreground">{customer}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              className="lg:hidden relative p-2.5 border border-border rounded-2xl bg-card hover:bg-accent transition-all duration-200 cursor-pointer"
              onClick={() => setShowMobileCart(true)}
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-card border-b border-border px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar z-10">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 border cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                  : 'bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-accent/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filtered.map((p) => {
                const cartItem = cart.find(c => c.id === p.id);
                const cfg = categoryConfig[p.category] ?? defaultConfig;
                const CategoryIcon = cfg.icon;
                return (
                  <motion.button 
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.18, type: 'spring', stiffness: 260, damping: 22 }}
                    key={p.id} 
                    onClick={() => addToCart(p)}
                    className={`relative text-left rounded-2xl p-4 border-2 transition-all duration-200 bg-card flex flex-col h-full group cursor-pointer clay-btn ${
                      cartItem 
                        ? 'border-primary ring-4 ring-primary/10 shadow-md' 
                        : 'border-card-border hover:border-primary/40 hover:shadow-md'
                    }`}
                    style={{
                      boxShadow: cartItem
                        ? '0 4px 14px rgba(22,163,74,0.18), 0 1px 3px rgba(0,0,0,0.06)'
                        : undefined
                    }}
                  >
                    {cartItem && (
                      <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-md z-10 border-2 border-white">
                        {cartItem.qty}
                      </div>
                    )}
                    <div 
                      className="w-full aspect-square rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-black/5 transition-transform duration-200 group-hover:scale-[1.04]"
                      style={{ background: cfg.bg }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: cfg.iconBg }}>
                        <CategoryIcon className="w-6 h-6 text-stone-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-primary mb-1 truncate">{p.brand}</div>
                      <div className="text-sm font-bold text-card-foreground leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-150">{p.name}</div>
                    </div>
                    <div className="flex items-end justify-between mt-auto pt-2 border-t border-border w-full">
                      <div className="text-lg font-display font-bold text-card-foreground">৳{p.price.toFixed(2)}</div>
                      {p.weight && <div className="text-xs font-semibold text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md">{p.weight}</div>}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-display font-bold text-xl text-card-foreground">No products found</p>
              <p className="text-sm mt-2 font-medium">Try a different search term or category</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart Right Sidebar */}
      <div className="hidden lg:flex w-96 border-l border-border flex-col bg-card shadow-[-4px_0_20px_-4px_rgba(0,0,0,0.07)] z-20 relative">
        <CartContent />
      </div>

      {/* Mobile Cart Drawer */}
      <AnimatePresence>
        {showMobileCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileCart(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card shadow-2xl z-50 flex flex-col"
            >
              <CartContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
