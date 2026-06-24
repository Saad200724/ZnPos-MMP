import { Truck } from 'lucide-react';

export function Suppliers() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Suppliers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your vendor relationships and contacts</p>
      </div>
      
      <div className="flex-1 bg-card rounded-2xl border border-card-border shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4">
          <Truck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-display font-bold text-card-foreground mb-2">Suppliers Module Under Construction</h2>
        <p className="text-muted-foreground max-w-md">
          This section will contain the complete list of suppliers, purchase agreements, and contact details.
        </p>
      </div>
    </div>
  );
}
