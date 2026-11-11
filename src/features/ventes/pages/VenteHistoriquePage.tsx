import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Eye, Clock, X, User } from 'lucide-react';
import { venteApi } from '../api/venteApi';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

export function VenteHistoriquePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ventes, setVentes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVente, setSelectedVente] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    venteApi.getVentesByUser(user.id)
      .then(setVentes)
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await venteApi.getVenteDetail(id);
      setSelectedVente(detail);
    } catch {
      toast.error("Impossible de charger le détail");
    }
  };

  if (isLoading) return <div className="p-10 text-xs text-slate-400 animate-pulse">Chargement de l'historique...</div>;

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-4">
      <div className="flex items-end gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
      </div>

      <div>
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-600" /> Mes Ventes
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">
          Historique de vos 100 dernières transactions.
        </p>
      </div>

      {ventes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Aucune vente enregistrée</p>
          <p className="text-xs text-slate-500 mt-1">Vos ventes apparaîtront ici après encaissement.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">N° Vente</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventes.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-bold text-slate-900">{v.id}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{v.dateVente}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {v.modePaiement}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-emerald-700 text-right font-mono">
                    {v.total.toLocaleString('fr-FR')} FBU
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewDetail(v.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Voir le détail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALE DÉTAIL */}
      {selectedVente && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40" onClick={() => setSelectedVente(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900">Détail de la vente</h2>
                <button onClick={() => setSelectedVente(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <p className="font-bold uppercase">Ticket {selectedVente.id}</p>
                  <p className="text-[10px] text-slate-500">{selectedVente.dateVente}</p>
                </div>
                
                <div className="space-y-1 text-slate-600">
                  <p className="flex items-center gap-1"><User className="w-3 h-3" /> Client : <span className="font-bold text-slate-900">{selectedVente.clientNom}</span></p>
                  <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> Vendeur : <span className="font-bold text-slate-900">{selectedVente.userNom}</span></p>
                </div>
                
                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                  {selectedVente.lignes.map((l: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{l.quantite}× {l.nomProduit}</span>
                      <span className="font-bold">{l.sousTotal.toLocaleString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold">
                  <span>TOTAL</span>
                  <span className="text-emerald-700">{selectedVente.total.toLocaleString('fr-FR')} FBU</span>
                </div>
                
                <p className="text-center text-[10px] text-slate-400 pt-2">
                  Payé par {selectedVente.modePaiement}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}