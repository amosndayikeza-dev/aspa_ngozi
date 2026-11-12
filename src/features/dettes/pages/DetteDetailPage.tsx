import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, User, Calendar, Clock, Receipt } from 'lucide-react';
import { detteApi } from '../api/detteApi';
import { toast } from 'sonner';

export function DetteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dette, setDette] = useState<any>(null);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      detteApi.getDette(id),
      detteApi.listPaiements(id),
    ])
      .then(([d, p]) => {
        setDette(d);
        setPaiements(p);
      })
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="p-10 text-xs text-slate-400 animate-pulse">Chargement...</div>;
  if (!dette) return null;

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-4">
      <button
        onClick={() => navigate('/dettes')}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Retour aux dettes
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-600" /> Dette {dette.id}
            </h1>
            <p className="text-[11px] text-slate-500 mt-1">Vente liée : {dette.venteId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Reste à payer</p>
            <p className="text-2xl font-black text-rose-600 font-mono">
              {dette.montantRestant.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">FBU</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><User className="w-3 h-3" /> Client</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{dette.clientNom}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Montant initial</p>
            <p className="text-sm font-bold font-mono text-slate-900 mt-1">{dette.montantInitial.toLocaleString('fr-FR')} FBU</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase">Déjà payé</p>
            <p className="text-sm font-bold font-mono text-emerald-700 mt-1">{dette.montantPaye.toLocaleString('fr-FR')} FBU</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Échéance</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{dette.dateEcheance}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {dette.joursRestants >= 0 ? `${dette.joursRestants} jours restants` : `⚠️ ${Math.abs(dette.joursRestants)} jours de retard`}
            </p>
          </div>
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Historique des paiements ({paiements.length})</h2>
        </div>
        {paiements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">Aucun paiement enregistré.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paiements.map((p, i) => (
              <div key={p.id} className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Versement #{paiements.length - i}</p>
                    <p className="text-[10px] text-slate-500">{new Date(p.datePaiement).toLocaleString('fr-FR')}</p>
                    <p className="text-[10px] text-slate-500">Par {p.userNom} • {p.modePaiement}</p>
                    {p.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">"{p.notes}"</p>}
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-700 font-mono">{p.montant.toLocaleString('fr-FR')} FBU</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}