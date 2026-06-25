import { Package2 } from 'lucide-react';
export function Inventory() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <Package2 className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Inventory</h2>
      <p className="text-muted-foreground text-sm max-w-xs">Stock levels, adjustments and warehouse management coming soon.</p>
    </div>
  );
}
