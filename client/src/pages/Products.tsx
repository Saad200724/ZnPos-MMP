import { useState } from 'react';
import { 
  Search, Filter, Download, Upload, Plus, Tag, AlertTriangle, Eye, Edit2, MoreHorizontal, Check, Package
} from 'lucide-react';
import { useGetProducts } from '@/lib/api';

const categories = ['All Categories', 'Dry Food', 'Wet Food', 'Treats', 'Supplements', 'Accessories'];

export function Products() {
  const [selected, setSelected] = useState<number[]>([]);
  const [filterCat, setFilterCat] = useState('All Categories');
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useGetProducts();

  const filtered = products.filter(p =>
    (filterCat === 'All Categories' || p.category === filterCat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search))
  );

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  return (
    <div className={`flex flex-col h-full bg-background p-4 sm:p-6 max-w-[1600px] mx-auto ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Products & Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your pet food inventory and pricing</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-semibold text-foreground transition-colors shadow-sm">
            <Upload className="w-4 h-4 text-primary" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-semibold text-foreground transition-colors shadow-sm">
            <Download className="w-4 h-4 text-primary" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-orange-600 text-primary-foreground text-sm font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-card-border shadow-sm flex flex-col min-h-0 flex-1">
        {/* Filters */}
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-accent/30 rounded-t-2xl">
          <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-foreground outline-none w-full placeholder-muted-foreground font-medium"
              placeholder="Search products, SKU..." 
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 shadow-sm">
              <Tag className="w-4 h-4 text-primary" />
              <select 
                value={filterCat} 
                onChange={e => setFilterCat(e.target.value)}
                className="text-sm font-semibold text-foreground outline-none bg-transparent cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="flex items-center gap-2 border border-border bg-background rounded-lg px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent transition-colors shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="hidden sm:inline">More Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-card rounded-b-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-accent/50 sticky top-0 z-10 border-b border-card-border">
              <tr>
                <th className="py-3 px-4 w-12 font-semibold text-muted-foreground">
                  <button onClick={toggleAll} className="flex items-center justify-center">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.length === filtered.length && filtered.length > 0 ? 'bg-primary border-primary text-white' : 'border-border bg-background'}`}>
                      {selected.length === filtered.length && filtered.length > 0 && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                </th>
                <th className="py-3 px-4 font-bold text-foreground">Product Details</th>
                <th className="py-3 px-4 font-bold text-foreground">Category</th>
                <th className="py-3 px-4 font-bold text-foreground text-right">Price</th>
                <th className="py-3 px-4 font-bold text-foreground text-right">Sale Price</th>
                <th className="py-3 px-4 font-bold text-foreground text-center">Stock</th>
                <th className="py-3 px-4 font-bold text-foreground text-center">Status</th>
                <th className="py-3 px-4 font-bold text-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const isSelected = selected.includes(p.id);
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock === 0;
                
                return (
                  <tr key={p.id} className={`group transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-accent/50'}`}>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelect(p.id)} className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-border bg-background group-hover:border-primary/50'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent border border-border text-xl flex-shrink-0 shadow-sm text-primary">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{p.name}</div>
                          <div className="flex items-center gap-2 text-xs mt-0.5">
                            <span className="text-primary font-semibold">{p.brand}</span>
                            <span className="text-muted-foreground font-mono bg-accent px-1.5 py-0.5 rounded">{p.sku}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-accent text-foreground border border-border shadow-sm">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-foreground">৳{p.price.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-muted-foreground">
                        ৳{p.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-md text-xs border ${
                        isOut ? 'bg-red-50 text-red-700 border-red-200' : 
                        isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {(isLow || isOut) && <AlertTriangle className="w-3 h-3" />}
                        {p.stock}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${p.active ? 'bg-green-500' : 'bg-muted-foreground'}`} title={p.active ? 'Active' : 'Inactive'} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-orange-50 text-primary transition-colors" title="Edit Product">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors" title="More Actions">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="p-4 border-t border-card-border bg-accent/30 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{filtered.length}</span> products
            {selected.length > 0 && <span className="ml-2 text-primary bg-primary/10 px-2 py-0.5 rounded-md">{selected.length} selected</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, '...', 8].map((page, i) => (
              <button 
                key={i} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  page === 1 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-background border border-border text-foreground hover:border-primary/50'
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
