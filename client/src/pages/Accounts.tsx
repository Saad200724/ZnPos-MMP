import { Landmark } from 'lucide-react';
export function Accounts() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <Landmark className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Accounts</h2>
      <p className="text-muted-foreground text-sm max-w-xs">Chart of accounts, ledger and financial management coming soon.</p>
    </div>
  );
}
