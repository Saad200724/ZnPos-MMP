import { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useLoginUser } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import logo from '/logo.png';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLoginUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { username, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        setLocation('/');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="Meow Meow Pet Shop" className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg object-cover" style={{ boxShadow: '0 8px 24px rgba(22,163,74,0.20), 0 2px 6px rgba(0,0,0,0.08)' }} />
          <h1 className="text-3xl font-display font-bold text-foreground">Meow Meow Pet Shop</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">POS — Staff Login</p>
        </div>

        <div className="clay-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  data-testid="input-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-accent text-foreground font-medium text-sm outline-none focus:border-primary focus:bg-card transition-all duration-200 placeholder-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  data-testid="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-accent text-foreground font-medium text-sm outline-none focus:border-primary focus:bg-card transition-all duration-200 placeholder-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                Invalid username or password. Please try again.
              </div>
            )}

            <button
              data-testid="button-login"
              type="submit"
              disabled={loginMutation.isPending}
              className="clay-btn w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6 font-medium">
            Default: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
