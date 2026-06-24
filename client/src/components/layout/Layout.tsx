import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Package, Users, ShoppingCart, Truck,
  Receipt, BarChart2, Settings, Menu, Search, User, Bell, X, LogOut, Zap
} from 'lucide-react';
import logo from '/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'POS Terminal', path: '/pos' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Truck, label: 'Suppliers', path: '/suppliers' },
  { icon: Receipt, label: 'Purchases', path: '/purchases' },
  { icon: BarChart2, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const currentPage = nav.find(n => n.path === location);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-sidebar-border">
        <div className="relative flex-shrink-0">
          <img src={logo} alt="Meow Meow" className="w-9 h-9 rounded-2xl object-cover ring-2 ring-sidebar-primary/40" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-white font-bold text-sm leading-tight">Meow Meow</div>
          <div className="text-[11px] text-sidebar-foreground/60 mt-0.5">Pet Shop POS</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 pb-3 text-sidebar-foreground/35">
          Main Menu
        </div>
        {nav.map(({ icon: Icon, label, path }) => {
          const active = location === path;
          return (
            <Link key={label} href={path} onClick={closeMobileMenu}>
              <div className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 cursor-pointer
                ${active
                  ? 'bg-sidebar-primary text-primary-foreground shadow-lg shadow-sidebar-primary/25'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'}
              `}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/80 rounded-r-full -ml-3" />
                )}
                <div className={`
                  w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200
                  ${active ? 'bg-white/20' : 'group-hover:bg-white/10'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate flex-1">{label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick POS CTA */}
      <div className="px-3 pb-3">
        <Link href="/pos" onClick={closeMobileMenu}>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-sidebar-primary/25 border border-sidebar-primary/35 text-sm font-bold text-white cursor-pointer hover:bg-sidebar-primary/45 transition-all duration-200 group">
            <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span>Open POS</span>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-sidebar-accent/50 transition-all duration-200 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-sidebar-primary text-white flex-shrink-0 shadow-md shadow-sidebar-primary/30">
            {user?.name?.substring(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate leading-tight">{user?.name ?? 'Admin'}</div>
            <div className="text-[11px] text-sidebar-foreground/55 truncate capitalize">{user?.role ?? 'Staff'}</div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); logout(); }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-sidebar-foreground/40 hover:text-red-400 transition-all duration-200 cursor-pointer flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[216px] flex-col bg-sidebar border-r border-sidebar-border shadow-xl z-20 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-[216px] bg-sidebar flex flex-col z-50 shadow-2xl"
            >
              <button
                onClick={closeMobileMenu}
                className="absolute top-4 right-4 z-50 p-1.5 bg-sidebar-accent rounded-lg text-sidebar-foreground hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between gap-3 z-10 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {currentPage && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center bg-primary/10 border border-primary/15 flex-shrink-0">
                  <currentPage.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-foreground text-base leading-tight truncate">
                    {currentPage.label}
                  </div>
                  <div className="hidden sm:block text-[11px] text-muted-foreground/70 leading-tight">
                    Meow Meow Pet Shop
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-accent/60 border border-border rounded-xl px-3 py-1.5 w-52 transition-all duration-200 focus-within:bg-background focus-within:border-primary focus-within:shadow-sm focus-within:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground/60"
                placeholder="Quick search..."
              />
            </div>

            {/* Bell */}
            <button className="relative p-2 rounded-xl hover:bg-accent transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
            </button>

            {/* Branch */}
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-primary/14 transition-all duration-200">
              <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground">{user?.branch ?? 'Main Branch'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
