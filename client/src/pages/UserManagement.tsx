import { UsersRound } from 'lucide-react';
export function UserManagement() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <UsersRound className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Users</h2>
      <p className="text-muted-foreground text-sm max-w-xs">User accounts, roles and access permissions coming soon.</p>
    </div>
  );
}
