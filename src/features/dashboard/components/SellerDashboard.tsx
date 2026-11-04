import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, TrendingUp, AlertTriangle, ArrowRight, 
  User, CheckCircle2, ChevronRight 
} from 'lucide-react';
import type { User as UserType } from '@/features/auth/types';
import { cn } from '@/shared/lib/cn';

export function SellerDashboard({ user }: { user: UserType }) {
  const navigate = useNavigate();

  // ---------- Données mockées pour le vendeur -----
  const mesVentesJour = 125000;
  const mesClientsServis = 8;
  const mesObjectifs = 200000; // Objectif de vente du jour

  // ------------ Simulation des alertes de stock (médicaments à ne plus vendre)
  const alertesStock = [
    { nom: 'Ivermectine 1%', raison: 'Rupture de stock' },
    { nom: 'Amoxicilline 500mg', raison: 'Stock critique (2 restants)' }
  ];

  const recentVentes = [
    { id: 'VNT-0012', heure: '10:24', total: 45000 },
    { id: 'VNT-0011', heure: '09:45', total: 80000 },
  ];

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
          
          {/*------------ BOUTON D'ACTION PRINCIPAL (POS) */}
          <button 
            onClick={() => navigate('/vente')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-6 shadow-lg shadow-emerald-600/20 flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
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

          {/* ----------------- MES STATISTIQUES DU JOUR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Mes Ventes (Jour)</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{mesVentesJour.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">FBU</span></p>
              
              {/* ------------------ Barre de progression Objectif */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Objectif : {mesObjectifs.toLocaleString('fr-FR')}</span>
                  <span className="text-emerald-600">{Math.round((mesVentesJour / mesObjectifs) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(mesVentesJour / mesObjectifs) * 100}%` }}
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
                <p className="text-2xl font-black text-slate-900">{mesClientsServis}</p>
              </div>
              <p className="text-[10px] text-slate-400">Aujourd'hui</p>
            </div>
          </div>

          {/* --------------  MES DERNIÈRES VENTES */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Mes dernières ventes</h3>
              <button onClick={() => navigate('/vente/historique')} className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentVentes.map((vente, i) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* --- COLONNE DROITE (1/3) --- */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* ALERTES DE STOCK (Important pour le vendeur) */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">Attention en caisse</h3>
            </div>
            <p className="text-[11px] text-amber-700 mb-3">Ces produits ne sont plus disponibles à la vente :</p>
            
            <div className="space-y-2">
              {alertesStock.map((alerte, i) => (
                <div key={i} className="bg-white rounded-lg p-2.5 border border-amber-100 shadow-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{alerte.nom}</p>
                    <p className="text-[10px] text-amber-600 font-medium">{alerte.raison}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*  ---------AIDE MÉMO 
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <h3 className="text-sm font-bold mb-1">Besoin d'aide ?</h3>
            <p className="text-[11px] text-slate-400 mb-3">Consultez le guide du vendeur pour gérer les retours ou les ordonnances.</p>
            <button className="w-full h-8 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors">
              Ouvrir le guide
            </button>
          </div>*/}

        </div>
      </div>
    </div>
  );
}