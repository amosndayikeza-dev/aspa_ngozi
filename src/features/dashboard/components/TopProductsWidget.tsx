import { Package } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface Product {
  nom: string;
  ventes: number;
  ca: number;
}

interface TopProductsWidgetProps {
  products: Product[];
}

export function TopProductsWidget({ products }: TopProductsWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      
      {/* En-tête */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600" /> Top des médicaments vendus
        </h2>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-4 py-2.5 w-16">Rang</th>
              <th className="px-4 py-2.5">Produit</th>
              <th className="px-4 py-2.5 text-right">Unités</th>
              <th className="px-4 py-2.5 text-right">Chiffre d'Affaires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((prod, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <span className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold",
                    index === 0 ? "bg-amber-100 text-amber-700" : 
                    index === 1 ? "bg-slate-200 text-slate-600" : 
                    index === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                  )}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs font-semibold text-slate-800">{prod.nom}</td>
                <td className="px-4 py-2.5 text-xs text-slate-600 text-right font-mono">{prod.ventes}</td>
                <td className="px-4 py-2.5 text-xs font-bold text-emerald-700 text-right font-mono">
                  {prod.ca.toLocaleString('fr-FR')} FBU
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}