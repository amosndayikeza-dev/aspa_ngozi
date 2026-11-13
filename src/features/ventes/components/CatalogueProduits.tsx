import { useState, useEffect } from 'react';
import { Search, Pill, Plus, PackageX } from 'lucide-react';
import { medicamentApi } from '@/features/stock/api/medicamentApi';
import type { Medicament } from '@/features/stock/types';
import { cn } from '@/shared/lib/cn';

interface CatalogueProps {
  onAddToCart: (med: Medicament) => void;
}

export function CatalogueProduits({ onAddToCart }: CatalogueProps) {
  const [medicament, setMedicament] = useState<Medicament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMed = async () => {
      try {
        const data = await medicamentApi.getMedicaments();
        setMedicament(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMed();
  }, []);

  const filtered = medicament.filter(m =>
    m.nom.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
    m.dci.toLowerCase().includes(searchTerm.toLocaleLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden select-none">
      {/* EN-TÊTE */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Catalogue Médicaments
          </h2>
          <p className="text-[10px] text-slate-500">
            {filtered.length} référence(s) disponible(s) en caisse
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Nom ou DCI du produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* GRILLE */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar bg-slate-50/30">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 py-16">
            <Pill className="w-7 h-7 mb-2 animate-bounce text-emerald-500" />
            <span>Chargement du catalogue pharmaceutique...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 py-16">
            <Search className="w-6 h-6 mb-2 text-slate-300" />
            <span>Aucun médicament ne correspond à votre recherche</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filtered.map((med) => {
              const stock = med.stock ?? 0;
              const rupture = stock <= 0;
              const stockFaible = stock > 0 && stock <= 5;

              return (
                <button
                  key={med.id}
                  onClick={() => onAddToCart(med)}
                  disabled={rupture}
                  title={rupture ? `${med.nom} — Rupture de stock` : `${stock} unité(s) en stock`}
                  className={cn(
                    "group bg-white border rounded-xl p-2.5 flex flex-col justify-between transition-all duration-150 text-left relative overflow-hidden",
                    rupture
                      ? "border-slate-200 opacity-60 cursor-not-allowed grayscale"
                      : "border-slate-200/90 hover:border-emerald-500/70 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {med.imageUrl ? (
                        <img src={med.imageUrl} alt={med.nom} className="w-full h-full object-cover" />
                      ) : (
                        <Pill className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        {med.categorie}
                      </span>
                      {rupture ? (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                          <PackageX className="w-2 h-2" /> Rupture
                        </span>
                      ) : stockFaible ? (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          Stock {stock}
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Stock {stock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 w-full">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
                      {med.nom}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                      {med.dci}
                    </p>
                  </div>

                  <div className="w-full flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100">
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {med.prixVente.toLocaleString('fr-FR')} FBU
                    </span>
                    <div
                      className={cn(
                        "p-1 rounded-md transition-all shadow-2xs",
                        rupture
                          ? "bg-slate-100 text-slate-400 border border-slate-200"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200/60 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-90 group-hover:scale-110"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}