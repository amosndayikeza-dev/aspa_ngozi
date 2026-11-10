import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, TrendingUp, AlertTriangle, ArrowRight, 
  User, CheckCircle2, ChevronRight 
} from 'lucide-react';
import type { User as UserType } from '@/features/auth/types';
import { statsApi } from '../api/statsApi'; // 👈 Import de l'API
import { toast } from 'sonner';

export function SellerDashboard({ user }: { user: UserType }) {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    statsApi.getSellerStats(user.id)
      .then(setData)
      .catch((e) => {
        console.error(e);
        toast.error("Erreur de chargement des statistiques");
      })
      .finally(() => setIsLoading(false));
  }, [user.id]);

  if (isLoading || !data) {
    return <div className="p-10 text-xs font-medium text-slate-400 animate-pulse">Chargement de votre espace...</div>;
  }

  const progressPercent = Math.min(Math.round((data.mesVentesJour / data.mesObjectifs) * 100), 100);

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto pb-10">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Espace Vendeur</h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Bonjour <span className="font-semibold text-slate-700">{user.nom}</span>, prêt pour une nouvelle journée ?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* --- COLONNE GAUCHE (2/3) --- */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* BOUTON D'ACTION PRINCIPAL (POS) */}
          <button 
            onClick={() => navigate('/vente')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-6 shadow-lg shadow-emerald-600/20 flex items-center justify-between group transition-all duration-300 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="flex items-center gap-5 relative z-10 text-left">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ouvrir la Caisse</h2>
                <p className="text-emerald-100 text-xs mt-1">Démarrer une nouvelle vente client</p>
              </div>
            </div>
            
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* MES STATISTIQUES DU JOUR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Mes Ventes (Jour)</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {data.mesVentesJour.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">FBU</span>
              </p>
              
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Objectif : {data.mesObjectifs.toLocaleString('fr-FR')}</span>
                  <span className="text-emerald-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Clients Servis</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{data.mesClientsServis}</p>
              </div>
              <p className="text-[10px] text-slate-400">Aujourd'hui</p>
            </div>
          </div>

          {/* MES DERNIÈRES VENTES */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Mes dernières ventes</h3>
              <button onClick={() => navigate('/vente/historique')} className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {data.recentVentes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">Aucune vente enregistrée pour le moment.</div>
              ) : (
                data.recentVentes.map((vente: any, i: number) => (
                  <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{vente.id}</p>
                        <p className="text-[10px] text-slate-500">{vente.heure}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{vente.total.toLocaleString('fr-FR')} FBU</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- COLONNE DROITE (1/3) --- */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* ALERTES DE STOCK */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">Attention en caisse</h3>
            </div>
            <p className="text-[11px] text-amber-700 mb-3">Ces produits sont en alerte de stock :</p>
            
            <div className="space-y-2">
              {data.alertesStock.length === 0 ? (
                <div className="text-xs text-amber-600 italic">Tous les stocks sont bons.</div>
              ) : (
                data.alertesStock.map((alerte: any, i: number) => (
                  <div key={i} className="bg-white rounded-lg p-2.5 border border-amber-100 shadow-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{alerte.nom}</p>
                      <p className="text-[10px] text-amber-600 font-medium">{alerte.raison}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}