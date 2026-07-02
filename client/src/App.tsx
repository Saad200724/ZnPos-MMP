import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { useGetMe } from "@/lib/api";
import NotFound from "@/pages/not-found";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { POSTerminal } from "@/pages/POSTerminal";
import { Products } from "@/pages/Products";
import { Customers } from "@/pages/Customers";
import { Suppliers } from "@/pages/Suppliers";
import { Purchases } from "@/pages/Purchases";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Inventory } from "@/pages/Inventory";
import { Sales } from "@/pages/Sales";
import { Accounts } from "@/pages/Accounts";
import { Quotations } from "@/pages/Quotations";
import { Expenses } from "@/pages/Expenses";
import { Assets } from "@/pages/Assets";
import { Employees } from "@/pages/Employees";
import { UserManagement } from "@/pages/UserManagement";
import { Messages } from "@/pages/Messages";
import { ActivityLog } from "@/pages/ActivityLog";
import { useEffect, type ReactNode } from "react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Mew Mew Pet Shop" className="w-24 h-24 rounded-full shadow-md animate-pulse" />
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#F97316]"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { isLoading, isError } = useGetMe({ query: { retry: false, staleTime: 5 * 60 * 1000 } });

  useEffect(() => {
    if (!isLoading && isError && location !== '/login') {
      setLocation('/login');
    }
    if (!isLoading && !isError && location === '/login') {
      setLocation('/');
    }
  }, [isLoading, isError, location, setLocation]);

  if (isLoading) return <LoadingScreen />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <AuthGuard>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/pos" component={POSTerminal} />
              <Route path="/sales" component={Sales} />
              <Route path="/products" component={Products} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/customers" component={Customers} />
              <Route path="/suppliers" component={Suppliers} />
              <Route path="/purchases" component={Purchases} />
              <Route path="/quotations" component={Quotations} />
              <Route path="/accounts" component={Accounts} />
              <Route path="/expenses" component={Expenses} />
              <Route path="/assets" component={Assets} />
              <Route path="/employees" component={Employees} />
              <Route path="/users" component={UserManagement} />
              <Route path="/messages" component={Messages} />
              <Route path="/reports" component={Reports} />
              <Route path="/activity-log" component={ActivityLog} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
