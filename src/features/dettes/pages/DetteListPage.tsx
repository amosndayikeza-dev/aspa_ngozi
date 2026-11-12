import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, AlertTriangle, CheckCircle2, Eye, Plus, Search, Filter } from 'lucide-react';
import { detteApi } from '../api/detteApi';
import { useAuth } from '@/features/auth';
import { Modal } from '@/shared/ui/Modal';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

export function DetteListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dettes, setDettes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState<'ALL' | 'EN_COURS' | 'SOLDE' | 'RETARD'>('EN_COURS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modale paiement
  const [paiementDette, setPaiementDette] = useState<any>(null);
  const [montantPaiement, setMontantPaiement] = useState<number>(0);
  const [modePaiement, setModePaiement] = useState('Espèces');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDettes = async () => {
    setIsLoading(true);
    try {
      const statut = statutFilter === 'ALL' ? undefined : statutFilter === 'RETARD' ? undefined : statutFilter;
      const data = await detteApi.listDettes(statut);
      setDettes(data);
    } catch (e) {
      toast.error("Erreur de chargement des dettes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDettes();
  }, [statutFilter]);

  // Filtrer côté client pour "RETARD" et recherche
  const filteredDettes = dettes.filter(d => {
    const matchRetard = statutFilter !== 'RETARD' || (d.statut === 'EN_COURS' && d.joursRestants < 0);
    const matchSearch = 
      d.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRetard && matchSearch;
  });

  // KPIs
  const totalCreances = dettes
    .filter(d => d.statut === 'EN_COURS')
    .reduce((sum, d) => sum + d.montantRestant, 0);
  const nbEnRetard = dettes.filter(d => d.statut === 'EN_COURS' && d.joursRestants < 0).length;
  const nbClientsDebiteurs = new Set(
    dettes.filter(d => d.statut === 'EN_COURS').map(d => d.clientId)
  ).size;

  // Ouvrir modale paiement
  const handleOpenPaiement = (dette: any) => {
    setPaiementDette(dette);
    setMontantPaiement(dette.montantRestant);
    setModePaiement('Espèces');
    setNotes('');
  };

  // Confirmer paiement
  const handleConfirmPaiement = async () => {
    if (!user || !paiementDette) return;
    if (montantPaiement <= 0) {
      toast.error("Le montant doit être supérieur à 0");
      return;
    }
    if (montantPaiement > paiementDette.montantRestant + 0.01) {
      toast.error("Le montant dépasse le reste à payer");
      return;
    }

    setIsProcessing(true);
    try {
      await detteApi.enregistrerPaiement({
        detteId: paiementDette.id,
        montant: montantPaiement,
        modePaiement: modePaiement,
        userId: user.id,
        notes: notes || null,
      });
      toast.success(`Versement de ${montantPaiement.toLocaleString('fr-FR')} FBU enregistré`);
      setPaiementDette(null);
      fetchDettes();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatutBadge = (dette: any) => {
    if (dette.statut === 'SOLDE') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Soldée</span>;
    }
    if (dette.joursRestants < 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase"><AlertTriangle className="w-3 h-3" /> Retard {Math.abs(dette.joursRestants)}j</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase"><Wallet className="w-3 h-3" /> {dette.joursRestants}j restants</span>;
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10 space-y-4">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-600" /> Gestion des Dettes
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Suivi des créances clients et encaissement des versements.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Wallet className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Créances</p>
            <p className="text-lg font-black text-slate-900 font-mono">{totalCreances.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FBU</span></p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dettes en retard</p>
            <p className="text-lg font-black text-rose-600">{nbEnRetard}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Wallet className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clients débiteurs</p>
            <p className="text-lg font-black text-slate-900">{nbClientsDebiteurs}</p>
          </div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Client ou n° dette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(['EN_COURS', 'RETARD', 'SOLDE', 'ALL'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatutFilter(f)}
              className={cn(
                "px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors",
                statutFilter === f ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {f === 'EN_COURS' ? 'En cours' : f === 'RETARD' ? 'En retard' : f === 'SOLDE' ? 'Soldées' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-400 animate-pulse">Chargement des dettes...</div>
        ) : filteredDettes.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Aucune dette trouvée</p>
            <p className="text-xs text-slate-500 mt-1">Les ventes à crédit apparaîtront ici.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Initial</th>
                <th className="px-4 py-3">Payé</th>
                <th className="px-4 py-3">Reste</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDettes.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-700">{d.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{d.clientNom}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{d.montantInitial.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-xs font-mono text-emerald-600">{d.montantPaye.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-xs font-mono font-bold text-rose-600">{d.montantRestant.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{d.dateEcheance}</td>
                  <td className="px-4 py-3">{getStatutBadge(d)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {d.statut === 'EN_COURS' && (
                        <button
                          onClick={() => handleOpenPaiement(d)}
                          className="px-2 py-1 text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors"
                        >
                          Encaisser
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/dettes/${d.id}`)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Voir détail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALE PAIEMENT */}
      {paiementDette && (
        <Modal
          isOpen={!!paiementDette}
          onClose={() => setPaiementDette(null)}
          title="Encaisser un versement"
          description={`Dette ${paiementDette.id} — ${paiementDette.clientNom}`}
          maxWidth="sm"
          variant="dialog"
        >
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Montant initial :</span>
                <span className="font-mono font-bold">{paiementDette.montantInitial.toLocaleString('fr-FR')} FBU</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Déjà payé :</span>
                <span className="font-mono text-emerald-700 font-bold">{paiementDette.montantPaye.toLocaleString('fr-FR')} FBU</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-amber-200">
                <span className="font-bold text-slate-900">Reste à payer :</span>
                <span className="font-mono font-black text-rose-600">{paiementDette.montantRestant.toLocaleString('fr-FR')} FBU</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Montant versé (FBU)</label>
              <input
                type="number"
                min={0}
                max={paiementDette.montantRestant}
                value={montantPaiement}
                onChange={(e) => setMontantPaiement(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Mode de paiement</label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option>Espèces</option>
                <option>Mobile Money</option>
                <option>Carte Bancaire</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Notes (optionnel)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarque..."
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPaiementDette(null)}
                className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPaiement}
                disabled={isProcessing}
                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {isProcessing ? 'Encaissement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}