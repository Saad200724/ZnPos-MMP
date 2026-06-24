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
import { useEffect, type ReactNode } from "react";
import { Cat } from "lucide-react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F97316] flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Cat className="w-9 h-9 text-white" />
        </div>
        <p className="text-[#78716C] font-semibold">Loading...</p>
      </div>
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
              <Route path="/products" component={Products} />
              <Route path="/customers" component={Customers} />
              <Route path="/suppliers" component={Suppliers} />
              <Route path="/purchases" component={Purchases} />
              <Route path="/reports" component={Reports} />
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
