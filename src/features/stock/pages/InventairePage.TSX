// src/features/stock/pages/InventairePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, AlertTriangle, CheckCircle2, 
  Search, ClipboardList, TrendingDown, Package, Boxes, X
} from 'lucide-react';
import { medicamentApi } from '../api/medicamentApi';
import type { Medicament } from '../types';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

export function InventairePage() {
  const navigate = useNavigate();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lotsReels, setLotsReels] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    medicamentApi.getMedicaments().then(data => {
      setMedicaments(data);
      // Initialise les lots avec leurs quantités actuelles
      const initial: Record<string, number> = {};
      data.forEach(m => m.lots.forEach(l => {
        initial[l.id] = l.quantite;
      }));
      setLotsReels(initial);
      setIsLoading(false);
    });
  }, []);

  const handleLotChange = (lotId: string, value: string) => {
    setLotsReels(prev => ({ ...prev, [lotId]: parseInt(value) || 0 }));
  };

  const handleSaveInventaire = async () => {
    setIsSaving(true);
    try {
      // Pour chaque lot modifié, on ajuste
      let modifs = 0;
      for (const med of medicaments) {
        for (const lot of med.lots) {
          const reel = lotsReels[lot.id];
          if (reel !== undefined && reel !== lot.quantite) {
            await medicamentApi.ajusterLotInventaire(lot.id, reel);
            modifs++;
          }
        }
      }
      
      toast.success(`Inventaire validé. ${modifs} lot(s) ajusté(s).`);
      navigate('/stock');
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'inventaire");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMedicaments = medicaments.filter(med => 
    med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dci.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPIs
  const totalProduits = medicaments.length;
  let lotsAvecEcart = 0;
  let totalManquant = 0;

  medicaments.forEach(med => {
    med.lots.forEach(lot => {
      const reel = lotsReels[lot.id] ?? lot.quantite;
      const ecart = reel - lot.quantite;
      if (ecart !== 0) lotsAvecEcart++;
      if (ecart < 0) totalManquant += Math.abs(ecart);
    });
  });

  if (isLoading) return <div className="p-10 text-xs text-slate-400 animate-pulse">Chargement...</div>;

  return (
    <div className="h-[calc(100vh-5.5rem)] max-w-[1400px] mx-auto flex flex-col gap-4">
      
      <div className="flex justify-between items-end shrink-0">
        <div>
          <button onClick={() => navigate('/stock')} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au stock
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Inventaire par lot
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Comptez chaque lot séparément. Les périmés peuvent être retirés (quantité = 0).
          </p>
        </div>
        <button
          onClick={handleSaveInventaire}
          disabled={isSaving}
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Enregistrement...' : "Valider l'inventaire"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Package className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Produits</p>
            <p className="text-base font-black text-slate-900">{totalProduits}</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Lots avec écart</p>
            <p className="text-base font-black text-amber-600">{lotsAvecEcart}</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><TrendingDown className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Unités manquantes</p>
            <p className="text-base font-black text-rose-600">-{totalManquant}</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredMedicaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Aucun médicament trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMedicaments.map(med => {
                const isExpanded = expandedId === med.id;
                const stockValide = med.stockValide ?? 0;
                const stockPerime = med.stockPerime ?? 0;
                
                return (
                  <div key={med.id}>
                    {/* Ligne produit (cliquable) */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : med.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Boxes className={cn("w-4 h-4", isExpanded ? 'text-emerald-600' : 'text-slate-400')} />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{med.nom}</p>
                          <p className="text-[10px] text-slate-400">{med.dci}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Lots</p>
                          <p className="text-xs font-bold text-slate-900">{med.lots.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Valide</p>
                          <p className={cn("text-xs font-bold", stockValide <= med.seuilAlerte ? 'text-rose-600' : 'text-emerald-600')}>
                            {stockValide}u
                          </p>
                        </div>
                        {stockPerime > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-rose-500 uppercase">Périmé</p>
                            <p className="text-xs font-bold text-rose-600">{stockPerime}u</p>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Lots (si étendu) */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 px-4 pb-3">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                              <th className="py-2">N° lot</th>
                              <th className="py-2 text-center">Péremption</th>
                              <th className="py-2 text-center">Théorique</th>
                              <th className="py-2 text-center">Réel compté</th>
                              <th className="py-2 text-center">Écart</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {med.lots.map(lot => {
                              const reel = lotsReels[lot.id] ?? lot.quantite;
                              const ecart = reel - lot.quantite;
                              const jours = lot.joursRestants ?? 0;
                              const isPerime = jours < 0;
                              
                              return (
                                <tr key={lot.id}>
                                  <td className="py-2 text-xs font-mono text-slate-800">
                                    {lot.numeroLot}
                                    {isPerime && <span className="ml-2 text-[9px] text-rose-600 font-bold">PÉRIMÉ</span>}
                                  </td>
                                  <td className="py-2 text-xs text-slate-600 text-center">
                                    {new Date(lot.datePeremption).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td className="py-2 text-xs font-mono font-bold text-slate-700 text-center">
                                    {lot.quantite}
                                  </td>
                                  <td className="py-2 text-center">
                                    <input
                                      type="number"
                                      min={0}
                                      value={reel}
                                      onChange={(e) => handleLotChange(lot.id, e.target.value)}
                                      className={cn(
                                        "w-20 h-7 text-center text-xs font-bold font-mono rounded border focus:outline-none focus:ring-2",
                                        ecart !== 0
                                          ? ecart > 0
                                            ? "border-amber-400 bg-amber-50 text-amber-700"
                                            : "border-rose-400 bg-rose-50 text-rose-700"
                                          : "border-slate-200 bg-white text-emerald-700 focus:ring-emerald-500/20"
                                      )}
                                    />
                                  </td>
                                  <td className="py-2 text-center">
                                    {ecart !== 0 ? (
                                      <span className={cn(
                                        "inline-flex text-[10px] font-bold font-mono px-1.5 py-0.5 rounded",
                                        ecart > 0 ? "text-amber-700 bg-amber-100" : "text-rose-700 bg-rose-100"
                                      )}>
                                        {ecart > 0 ? `+${ecart}` : ecart}
                                      </span>
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}