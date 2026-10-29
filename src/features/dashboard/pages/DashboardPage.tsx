// src/features/dashboard/pages/DashboardPage.tsx
import { useAuth } from '@/features/auth';
import { StatCard } from '../components/StatCard';
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  CalendarDays, 
  ArrowRight, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Clock
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  // Date du jour formatée
  const today = new Date().toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-6 select-none">
      
      {/* --- EN-TÊTE DU COCKPIT --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Tableau de bord clinique
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-medium font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live POS
            </span>
          </div>
          <div className="flex items-center text-[11px] text-slate-500 mt-0.5 gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>{today}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Session active : {user?.nom}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-[11px] text-slate-600 shadow-2xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Actualisé à l'instant</span>
          </div>
        </div>
      </div>

      {/* --- BENTO GRID : CARTES KPIs PRINCIPALES (Asymétrique) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1 : Ventes du jour (Hero) */}
        <StatCard 
          title="Ventes du jour" 
          value="485 000 FBU" 
          icon={ShoppingCart} 
          trend={{ value: '+12.4%', isPositive: true }} 
          subtitle="Obj: 600 000 FBU"
          iconColor="teal"
          sparkline="up"
          progress={{ percent: 81, label: "Quota journalier" }}
        />

        {/* KPI 2 : Bénéfice net estimé */}
        <StatCard 
          title="Bénéfice estimé" 
          value="126 000 FBU" 
          icon={DollarSign} 
          trend={{ value: '+8.2%', isPositive: true }} 
          subtitle="Marge brute: 26.0%"
          iconColor="blue"
          sparkline="up"
        />

        {/* KPI 3 : État du stock */}
        <StatCard 
          title="Références en stock" 
          value="1 284" 
          icon={Package} 
          subtitle="1 520 catalogués"
          iconColor="purple"
          progress={{ percent: 84, label: "Taux de disponibilité" }}
        />

        {/* KPI 4 : Alertes & Urgences */}
        <StatCard 
          title="Alertes actives" 
          value="12 lots" 
          icon={AlertTriangle} 
          trend={{ value: '+3 urgences', isPositive: false }} 
          subtitle="3 péremptions proches"
          iconColor="red"
          sparkline="down"
        />
      </div>

      {/* --- SECTION CENTRALE : TÉLÉMÉTRIE HEBDOMADAIRE & CENTRE DE TRIAGE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Graphique de Télémétrie des Ventes (8 colonnes sur 12) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          
          {/* En-tête du widget */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Télémétrie des Ventes Hebdomadaires
                </h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Volume cumulé des encaissements et moyenne journalière
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sélecteur de période épuré */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                <button className="px-2 py-0.5 text-[10px] font-semibold bg-white text-slate-900 rounded-md shadow-2xs border border-slate-200/60">
                  7 jours
                </button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  30 jours
                </button>
                <button className="px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  Trimestre
                </button>
              </div>
            </div>
          </div>

          {/* Métriques d'accompagnement condensées */}
          <div className="grid grid-cols-3 gap-2 mb-3 px-3 py-2 bg-slate-50/80 rounded-lg border border-slate-200/50">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Panier moyen</span>
              <span className="font-mono text-xs font-bold text-slate-800">42 500 FBU</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Pic d'activité</span>
              <span className="font-mono text-xs font-bold text-emerald-600">Samedi (580k FBU)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Taux d'encaissement</span>
              <span className="font-mono text-xs font-bold text-slate-800">98.4% comptant</span>
            </div>
          </div>

          {/* Visualisation SVG Haute Définition */}
          <div className="w-full h-[180px] relative flex flex-col justify-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Lignes de repère horizontales */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

              {/* Surface sous la courbe */}
              <polygon
                points="0,160 0,130 116,95 233,110 350,60 466,75 583,20 700,50 700,160"
                fill="url(#salesGrad)"
              />

              {/* Courbe principale */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,130 116,95 233,110 350,60 466,75 583,20 700,50"
              />

              {/* Points d'ancrage avec effet de surbrillance sur le pic */}
              <circle cx="116" cy="95" r="3" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              <circle cx="233" cy="110" r="3" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              <circle cx="350" cy="60" r="3" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              <circle cx="466" cy="75" r="3" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              
              {/* Pic samedi (Highlight néon) */}
              <circle cx="583" cy="20" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" className="shadow-lg" />
              <circle cx="700" cy="50" r="3" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
            </svg>

            {/* Légende jours */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 px-1">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span className="font-bold text-emerald-600">Sam (Pic)</span>
              <span>Dim</span>
            </div>
          </div>
        </div>

        {/* Centre de Triage & Alertes Critiques (4 colonnes sur 12) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Centre de Triage
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200/60 px-1.5 py-0.5 rounded">
                3 prioritaires
              </span>
            </div>

            <div className="space-y-2">
              {/* Alerte 1 : Péremption courte */}
              <div className="p-2.5 rounded-lg border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50/70 transition-all flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-slate-900 leading-tight">Oxytétracycline 10%</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">
                    J-12
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-mono">Lot #OX202504</span>
                  <button className="text-[10px] font-semibold text-rose-700 hover:underline">
                    Isoler le lot →
                  </button>
                </div>
              </div>

              {/* Alerte 2 : Stock critique */}
              <div className="p-2.5 rounded-lg border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 leading-tight">Ivermectine Injectable</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    Stock : 3
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Seuil min : 15 flacons</span>
                  <button className="text-[10px] font-semibold text-amber-800 hover:underline">
                    Commander →
                  </button>
                </div>
              </div>

              {/* Alerte 3 : Péremption Newcastle */}
              <div className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 leading-tight">Vaccin Newcastle</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                    J-20
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-mono">Lot #VN202401</span>
                  <button className="text-[10px] font-semibold text-slate-600 hover:underline">
                    Inspecter →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <button className="w-full py-1.5 text-center text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer">
              <span>Voir tout le registre des alertes (12)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* --- TABLEAU DES DERNIÈRES TRANSACTIONS : LIVE POS FEED --- */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        
        {/* En-tête du tableau */}
        <div className="px-4 py-3 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Flux des Dernières Transactions (POS)
            </h2>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-mono text-[10px] font-semibold">
              3 récentes
            </span>
          </div>
          <button className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer">
            <span>Toutes les ventes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        {/* Contenu tabulaire ultra-dense */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-2 px-3">Réf Facture</th>
                <th className="py-2 px-3">Client</th>
                <th className="py-2 px-3">Détail Articles</th>
                <th className="py-2 px-3 text-right">Montant Total</th>
                <th className="py-2 px-3 text-center">Paiement</th>
                <th className="py-2 px-3 text-center">Statut</th>
                <th className="py-2 px-3 text-right">Horodatage</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 text-slate-700">
              
              {/* Ligne 1 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2 px-3 font-mono text-[11px] font-semibold text-slate-700">
                  <span className="bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
                    VNT-2026-0015
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      J
                    </div>
                    <span className="font-medium text-slate-900">Jean Niyonzima</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className="font-semibold text-slate-800">2 articles</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">(Vermox, Gardénal)</span>
                </td>
                <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                  78 000 FBU
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-sky-50 text-sky-700 border border-sky-200/60">
                    Mobile Money
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Payée
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400 font-mono text-[11px] text-right">
                  18/10 10:24
                </td>
              </tr>
              
              {/* Ligne 2 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2 px-3 font-mono text-[11px] font-semibold text-slate-700">
                  <span className="bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
                    VNT-2026-0014
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px]">
                      M
                    </div>
                    <span className="font-medium text-slate-900">Marie Ndayishimiye</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className="font-semibold text-slate-800">3 articles</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">(Ivermectine, Vitamine B12...)</span>
                </td>
                <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                  124 000 FBU
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    Espèces
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Payée
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400 font-mono text-[11px] text-right">
                  18/10 09:17
                </td>
              </tr>

              {/* Ligne 3 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2 px-3 font-mono text-[11px] font-semibold text-slate-700">
                  <span className="bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
                    VNT-2026-0013
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                      E
                    </div>
                    <span className="font-medium text-slate-900">Élevage Kazoza</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className="font-semibold text-slate-800">5 articles</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">(Aliment, Antibiotique...)</span>
                </td>
                <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                  215 000 FBU
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-sky-50 text-sky-700 border border-sky-200/60">
                    Mobile Money
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Payée
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400 font-mono text-[11px] text-right">
                  18/10 08:42
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pied de télémétrie du tableau */}
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/60 flex flex-wrap justify-between items-center text-[11px] font-medium text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Recette journalière : <strong className="font-mono text-slate-900 ml-1">485 000 FBU</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              3 transactions synchronisées
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>3 articles nécessitent réapprovisionnement</span>
          </div>
        </div>
      </div>

    </div>
  );
}