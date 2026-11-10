import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, AlertTriangle, CheckCircle2, 
  Search, ClipboardList, TrendingDown, Package
} from 'lucide-react';
import { medicamentApi } from '../api/medicamentApi';
import type { Medicament } from '../types';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

export function InventairePage() {
  const navigate = useNavigate();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [stockReel, setStockReel] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    medicamentApi.getMedicaments().then(data => {
      setMedicaments(data);
      const initialReel: Record<string, number> = {};
      data.forEach(m => {
        initialReel[m.id] = m.lots.reduce((sum, l) => sum + l.quantite, 0);
      });
      setStockReel(initialReel);
      setIsLoading(false);
    });
  }, []);

  const handleStockReelChange = (medId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setStockReel(prev => ({ ...prev, [medId]: numValue }));
  };

  // ✅ VRAIE SAUVEGARDE DANS SQLITE
  const handleSaveInventaire = async () => {
    setIsSaving(true);
    try {
      // On parcourt tous les médicaments qui ont un écart
      const promises = medicaments.map(async (med) => {
        const theorique = med.lots.reduce((sum, l) => sum + l.quantite, 0);
        const reel = stockReel[med.id] ?? theorique;
        
        if (reel !== theorique) {
          // On doit envoyer le payload complet attendu par le backend
          const rustPayload = {
            nom: med.nom,
            dci: med.dci,
            forme: med.forme,
            prixAchat: med.prixAchat,
            prixVente: med.prixVente,
            stock: reel, // 👈 Nouveau stock ajusté
            seuilAlerte: med.seuilAlerte,
            datePeremption: med.lots[0]?.datePeremption || null,
            imagePath: med.imageUrl || null
          };
          return medicamentApi.updateMedicament(med.id, rustPayload);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      toast.success("Inventaire validé. Les écarts ont été enregistrés en base.");
      navigate('/stock');
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la validation de l'inventaire");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMedicaments = medicaments.filter(med => 
    med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dci.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProduits = medicaments.length;
  let produitsAvecEcart = 0;
  let totalManquant = 0;

  medicaments.forEach(med => {
    const theorique = med.lots.reduce((sum, l) => sum + l.quantite, 0);
    const reel = stockReel[med.id] ?? theorique;
    const ecart = reel - theorique;
    
    if (ecart !== 0) produitsAvecEcart++;
    if (ecart < 0) totalManquant += Math.abs(ecart);
  });

  if (isLoading) return <div className="p-10 text-sm text-text-muted animate-pulse">Chargement de l'inventaire...</div>;

  return (
    <div className="h-[calc(100vh-5.5rem)] max-w-[1400px] mx-auto flex flex-col gap-4">
      {/* ... (Le reste de l'interface ne change pas, tu peux garder ton code tel quel) ... */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <button 
            onClick={() => navigate('/stock')} 
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au stock
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Session d'Inventaire
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Saisissez les quantités physiquement comptées dans les rayons.
          </p>
        </div>
        <button
          onClick={handleSaveInventaire}
          disabled={isSaving}
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Enregistrement...' : "Valider l'inventaire"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Package className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Produits à vérifier</p>
            <p className="text-base font-black text-slate-900">{totalProduits}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Produits avec écart</p>
            <p className="text-base font-black text-amber-600">{produitsAvecEcart}</p>
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

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col flex-1 overflow-hidden">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un médicament par nom ou DCI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 z-10 shadow-sm">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Médicament</th>
                <th className="px-4 py-2.5 text-center w-32">Théorique</th>
                <th className="px-4 py-2.5 text-center w-40">Stock Réel (Compté)</th>
                <th className="px-4 py-2.5 text-center w-32">Écart</th>
                <th className="px-4 py-2.5 text-right w-24">Statut</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100/80">
              {filteredMedicaments.map(med => {
                const theorique = med.lots.reduce((sum, l) => sum + l.quantite, 0);
                const reel = stockReel[med.id] ?? theorique;
                const ecart = reel - theorique;
                const hasEcart = ecart !== 0;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-slate-900">{med.nom}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{med.dci}</p>
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {theorique}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        value={reel}
                        onChange={(e) => handleStockReelChange(med.id, e.target.value)}
                        className={cn(
                          "w-20 h-8 text-center text-xs font-bold font-mono rounded-lg border focus:outline-none focus:ring-2 transition-all",
                          hasEcart
                            ? ecart > 0 
                              ? "border-amber-400 bg-amber-50 text-amber-700 focus:ring-amber-500/20" 
                              : "border-rose-400 bg-rose-50 text-rose-700 focus:ring-rose-500/20"   
                            : "border-slate-200 bg-white text-emerald-700 focus:ring-emerald-500/20 focus:border-emerald-500" 
                        )}
                      />
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      {hasEcart ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-black font-mono px-2 py-0.5 rounded",
                          ecart > 0 ? "text-amber-700 bg-amber-100/50" : "text-rose-700 bg-rose-100/50"
                        )}>
                          {ecart > 0 ? `+${ecart}` : ecart}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      {hasEcart ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                          ecart > 0 
                            ? "text-amber-700 bg-amber-50 border-amber-200" 
                            : "text-rose-700 bg-rose-50 border-rose-200"
                        )}>
                          <AlertTriangle className="w-3 h-3" /> 
                          {ecart > 0 ? 'Surplus' : 'Manquant'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Conforme
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredMedicaments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Aucun médicament trouvé</p>
              <p className="text-xs">Essayez un autre nom ou DCI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}