import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Package, Users, ShoppingCart, Truck,
  Receipt, BarChart2, Settings, Menu, Search, Bell, X, LogOut, Zap,
  Package2, TrendingUp, Landmark, FileText, ArrowDownLeft,
  Boxes, UserCheck, UsersRound, MessageSquare, Activity, ChevronDown
} from 'lucide-react';
import logo from '/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = { icon: React.ElementType; label: string; path: string };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    ],
  },
  {
    title: 'Sales & Operations',
    items: [
      { icon: ShoppingCart, label: 'POS Terminal', path: '/pos' },
      { icon: TrendingUp, label: 'Sales', path: '/sales' },
      { icon: Receipt, label: 'Purchases', path: '/purchases' },
      { icon: FileText, label: 'Quotations', path: '/quotations' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { icon: Package, label: 'Products', path: '/products' },
      { icon: Package2, label: 'Inventory', path: '/inventory' },
    ],
  },
  {
    title: 'People',
    items: [
      { icon: Users, label: 'Customers', path: '/customers' },
      { icon: Truck, label: 'Suppliers', path: '/suppliers' },
      { icon: UserCheck, label: 'Employees', path: '/employees' },
      { icon: UsersRound, label: 'Users', path: '/users' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { icon: Landmark, label: 'Accounts', path: '/accounts' },
      { icon: ArrowDownLeft, label: 'Expenses', path: '/expenses' },
      { icon: Boxes, label: 'Assets', path: '/assets' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { icon: BarChart2, label: 'Reports', path: '/reports' },
      { icon: Activity, label: 'Activity Log', path: '/activity-log' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: MessageSquare, label: 'Messages', path: '/messages' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const currentPage = allNavItems.find(n => n.path === location);

  const toggleGroup = (title: string) =>
    setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-[17px] border-b border-sidebar-border flex-shrink-0">
        <div className="relative flex-shrink-0">
          <img src={logo} alt="Meow Meow" className="w-9 h-9 rounded-2xl object-cover ring-2 ring-sidebar-primary/40" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-white font-bold text-sm leading-tight">Meow Meow</div>
          <div className="text-[11px] text-sidebar-foreground/55 mt-0.5 font-medium">Pet Shop POS</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 scrollbar-thin">
        {navGroups.map((group) => {
          const isOpen = !collapsed[group.title];
          const hasActive = group.items.some(i => i.path === location);
          return (
            <div key={group.title} className="mb-1">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 mb-0.5 rounded-lg group cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/35 group-hover:text-sidebar-foreground/55 transition-colors">
                  {group.title}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-sidebar-foreground/30 transition-transform duration-200 group-hover:text-sidebar-foreground/50 ${isOpen ? '' : '-rotate-90'}`}
                />
              </button>

              {/* Group items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {group.items.map(({ icon: Icon, label, path }) => {
                      const active = location === path;
                      return (
                        <Link key={label} href={path} onClick={closeMobileMenu}>
                          <div className={`
                            group/item relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold
                            transition-all duration-150 cursor-pointer mb-0.5
                            ${active
                              ? 'bg-sidebar-primary text-primary-foreground shadow-sm shadow-sidebar-primary/30'
                              : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white'}
                          `}>
                            {active && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white/70 rounded-r-full" />
                            )}
                            <div className={`
                              w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150
                              ${active ? 'bg-white/20' : 'group-hover/item:bg-white/10'}
                            `}>
                              <Icon className="w-[15px] h-[15px]" />
                            </div>
                            <span className="truncate flex-1">{label}</span>
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick POS CTA */}
      <div className="px-2.5 pb-2.5 flex-shrink-0">
        <Link href="/pos" onClick={closeMobileMenu}>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30 text-[13px] font-bold text-white cursor-pointer hover:bg-sidebar-primary/35 transition-all duration-200 group">
            <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span>Open POS Terminal</span>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-2.5 pb-3 border-t border-sidebar-border pt-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-sidebar-accent/50 transition-all duration-200 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-sidebar-primary text-white flex-shrink-0 shadow-md shadow-sidebar-primary/30">
            {user?.name?.substring(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate leading-tight">{user?.name ?? 'Admin'}</div>
            <div className="text-[11px] text-sidebar-foreground/50 truncate capitalize">{user?.role ?? 'Staff'}</div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); logout(); }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-sidebar-foreground/35 hover:text-red-400 transition-all duration-200 cursor-pointer flex-shrink-0"
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
      <aside className="hidden lg:flex w-[220px] flex-col bg-sidebar border-r border-sidebar-border shadow-xl z-20 flex-shrink-0">
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
              className="fixed inset-y-0 left-0 w-[220px] bg-sidebar flex flex-col z-50 shadow-2xl"
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
        <header className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between gap-3 z-10 shadow-sm flex-shrink-0">
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
            <div className="hidden md:flex items-center gap-2 bg-accent/60 border border-border rounded-xl px-3 py-1.5 w-52 transition-all duration-200 focus-within:bg-background focus-within:border-primary focus-within:shadow-sm focus-within:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground/60"
                placeholder="Quick search..."
              />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-accent transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-primary/14 transition-all duration-200">
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
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
