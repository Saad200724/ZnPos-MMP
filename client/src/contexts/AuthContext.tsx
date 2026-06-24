import { createContext, useContext, type ReactNode } from 'react';
import { useGetMe, useLogoutUser } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  });
  const logoutMutation = useLogoutUser();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        queryClient.removeQueries();
        window.location.href = import.meta.env.BASE_URL + 'login';
      }
    });
  };

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isLoading,
      isAuthenticated: !isLoading && !isError && !!user,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
