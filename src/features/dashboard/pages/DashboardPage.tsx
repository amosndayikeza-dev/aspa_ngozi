// src/features/dashboard/pages/DashboardPage.tsx
import { useAuth } from '@/features/auth';
import { StatCard } from '../components/StatCard';
import { ShoppingCart, DollarSign, Package, AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  // Date du jour formatée
  const today = new Date().toLocaleDateString('fr-FR', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* --- TITRE DE LA PAGE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-1xl font-extrabold text-gray-800">Tableau de bord</h1>
          <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {/* --- GRILLE DES KPIs (4 Cartes) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ventes aujourd'hui" 
          value="485 000 FBU" 
          icon={ShoppingCart} 
          trend={{ value: '+12%', isPositive: true }} 
          subtitle="par rapport à hier"
          iconColor="teal"
        />
        <StatCard 
          title="Bénéfice estimé" 
          value="126 000 FBU" 
          icon={DollarSign} 
          trend={{ value: '+8%', isPositive: true }} 
          subtitle="par rapport à hier"
          iconColor="blue"
        />
        <StatCard 
          title="Produits en stock" 
          value="1 284" 
          icon={Package} 
          subtitle="sur 1 520 références"
          iconColor="purple"
        />
        <StatCard 
          title="Alertes péremption" 
          value="12" 
          icon={AlertTriangle} 
          trend={{ value: '+5', isPositive: false }} 
          subtitle="par rapport à hier"
          iconColor="red"
        />
      </div>

      {/* --- SECTION CENTRALE (Graphique & Alertes) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique (Prend 2 colonnes sur 3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-gray-800">Ventes de la semaine</h2>
            <select className="text-sm border-gray-200 rounded-lg text-gray-600 bg-gray-50 px-3 py-1.5 outline-none">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          {/* Zone réservée au futur graphique (Recharts, Chart.js...) */}
          <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center min-h-[300px] text-gray-400">
            [ Composant Graphique à insérer ici ]
          </div>
        </div>

        {/* Alertes à traiter (Prend 1 colonne sur 3) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-gray-800">Alertes à traiter</h2>
            <button className="text-xs font-semibold text-brand-dark hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
            {/* Alerte 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-red-50 text-vet-danger rounded-lg shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">Oxytétracycline 10%</p>
                <p className="text-xs text-gray-500 mt-0.5">Lot n°OX202504 — expire dans 12 jours</p>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-vet-danger px-2 py-1 rounded-md uppercase">Péremption</span>
            </div>

            {/* Alerte 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-yellow-50 text-vet-gold rounded-lg shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">Ivermectine</p>
                <p className="text-xs text-gray-500 mt-0.5">Stock faible (3 unités restantes)</p>
              </div>
              <span className="text-[10px] font-bold bg-yellow-100 text-vet-gold px-2 py-1 rounded-md uppercase">Stock bas</span>
            </div>
            
            {/* Alerte 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-red-50 text-vet-danger rounded-lg shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Vaccin Newcastle</p>
                <p className="text-xs text-gray-500 mt-0.5">Lot n°VN202401 — expire dans 20 jours</p>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-vet-danger px-2 py-1 rounded-md uppercase">Péremption</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLEAU DES DERNIÈRES VENTES --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Dernières ventes</h2>
          <button className="text-xs font-semibold text-brand-dark hover:underline flex items-center gap-1">
            Voir toutes les ventes <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Référence</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Articles</th>
                <th className="p-4 font-semibold">Montant</th>
                <th className="p-4 font-semibold">Paiement</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
              {/* Ligne 1 */}
              <tr className="hover:bg-brand-bg/50 transition-colors">
                <td className="p-4 font-medium">VNT-2026-0015</td>
                <td className="p-4">Jean Niyonzima</td>
                <td className="p-4">
                  <span className="font-medium text-gray-800">2 articles</span>
                  <span className="block text-xs text-gray-500">(Vermox, Gardénal)</span>
                </td>
                <td className="p-4 font-bold">78 000 MGA</td>
                <td className="p-4"><span className="bg-brand-light/50 text-brand-dark px-2.5 py-1 rounded-md text-xs font-semibold">Mobile Money</span></td>
                <td className="p-4"><span className="bg-green-100 text-vet-success px-2.5 py-1 rounded-md text-xs font-bold uppercase">Payée</span></td>
                <td className="p-4 text-gray-500 text-xs">18/10/2026 10:24</td>
              </tr>
              
              {/* Ligne 2 */}
              <tr className="hover:bg-brand-bg/50 transition-colors">
                <td className="p-4 font-medium">VNT-2026-0014</td>
                <td className="p-4">Marie Ndayishimiye</td>
                <td className="p-4">
                  <span className="font-medium text-gray-800">3 articles</span>
                  <span className="block text-xs text-gray-500">(Ivermectine, Vitamine B12...)</span>
                </td>
                <td className="p-4 font-bold">124 000 MGA</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">Espèces</span></td>
                <td className="p-4"><span className="bg-green-100 text-vet-success px-2.5 py-1 rounded-md text-xs font-bold uppercase">Payée</span></td>
                <td className="p-4 text-gray-500 text-xs">18/10/2026 09:17</td>
              </tr>

               {/* Ligne 3 */}
               <tr className="hover:bg-brand-bg/50 transition-colors">
                <td className="p-4 font-medium">VNT-2026-0013</td>
                <td className="p-4">Élevage Kazoza</td>
                <td className="p-4">
                  <span className="font-medium text-gray-800">5 articles</span>
                  <span className="block text-xs text-gray-500">(Aliment, Antibiotique...)</span>
                </td>
                <td className="p-4 font-bold">215 000 MGA</td>
                <td className="p-4"><span className="bg-brand-light/50 text-brand-dark px-2.5 py-1 rounded-md text-xs font-semibold">Mobile Money</span></td>
                <td className="p-4"><span className="bg-green-100 text-vet-success px-2.5 py-1 rounded-md text-xs font-bold uppercase">Payée</span></td>
                <td className="p-4 text-gray-500 text-xs">18/10/2026 08:42</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pied du tableau */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs font-medium text-gray-600">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-vet-success"></div>
            Total des ventes (aujourd'hui) : <span className="font-bold text-gray-800">632 000 FBU</span>
          </span>
          <span className="flex items-center gap-2 text-vet-danger">
            <div className="w-2 h-2 rounded-full bg-vet-danger"></div>
            Stock critique : 3 produits
          </span>
        </div>
      </div>

    </div>
  );
}