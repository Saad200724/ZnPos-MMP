import { UserCheck } from 'lucide-react';
export function Employees() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <UserCheck className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Employees</h2>
      <p className="text-muted-foreground text-sm max-w-xs">Staff records, schedules and HR management coming soon.</p>
    </div>
  );
}
