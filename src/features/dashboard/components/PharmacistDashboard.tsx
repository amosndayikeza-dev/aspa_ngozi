// src/features/dashboard/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { 
  DollarSign, TrendingUp, Users, ShoppingCart, Activity, 
  Wallet, AlertTriangle, Receipt, ArrowRight, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { statsApi } from '../api/statsApi';
import { KpiCard } from '../components/KpiCard';
import { TopProductsWidget } from '../components/TopProductsWidget'; 
import { cn } from '@/shared/lib/cn';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    statsApi.getPharmacistStats().then((res: any) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return <div className="p-10 text-xs font-medium text-slate-400 animate-pulse">Chargement du tableau de bord...</div>;
  }

  const formatMGA = (val: number) => `${(val / 1000).toFixed(0)}k FBU`;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Vue d'ensemble</h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Bonjour <span className="font-semibold text-slate-700">{user?.nom}</span>, voici l'activité d'aujourd'hui.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/vente/historique')}
            className="h-8 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            Voir l'historique
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-emerald-500" /> Données en temps réel
          </div>
        </div>
      </div>

      {/* --- LE KPI STRIP (8 CARTES SUR UNE SEULE LIGNE EN XL) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
        
        <KpiCard compact title="CA (Jour)" value={data.kpis.caJour} unit="FBU" icon={DollarSign} />
        <KpiCard compact title="Bénéf. (Mois)" value={data.kpis.beneficeMois} unit="FBU" icon={TrendingUp} />
        <KpiCard compact title="Clients (Jour)" value={data.kpis.clientsServis} icon={Users} />
        <KpiCard compact title="Ventes (7j)" value={data.kpis.caSemaine} unit="FBU" icon={ShoppingCart} />

        <KpiCard compact title="Valeur Stock" value={data.valeurStock || 0} unit="FBU" icon={Package} />

        {/* Carte "Stock périmé" harmonisée (style alerte compact) */}
        <div className="relative p-2.5 rounded-xl border border-rose-200 bg-rose-50 shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-start relative z-10">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 relative z-10">
            <p className="text-[10px] font-medium text-rose-700 truncate">Stock périmé</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-base font-bold tracking-tight text-rose-700">
                {(data.valeurStockPerime || 0).toLocaleString('fr-FR')}
              </p>
              <span className="text-[9px] font-medium text-rose-500">FBU</span>
            </div>
          </div>
        </div>

        <KpiCard compact title="Créances" value={data.totalCreances || 0} unit="FBU" icon={Wallet} variant="dark" />

        {/* Carte "Dettes en retard" harmonisée (style alerte compact) */}
        <div className="relative p-2.5 rounded-xl border border-rose-200 bg-rose-50 shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-start relative z-10">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 relative z-10">
            <p className="text-[10px] font-medium text-rose-700 truncate">Dettes retard</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-base font-bold tracking-tight text-rose-700">
                {data.nbDettesRetard || 0}
              </p>
              <span className="text-[9px] font-medium text-rose-500">client(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIGNE DES GRAPHIQUES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Graphique Courbe */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900">Évolution des ventes</h2>
            <button
              onClick={() => navigate('/vente/historique')}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.ventesSemaine} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                  formatter={(value: any) => [`${value.toLocaleString('fr-FR')} FBU`, 'Ventes']}
                />
                <Area type="monotone" dataKey="ventes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVentes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Camembert */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Répartition du CA</h2>
          <div className="flex-1 min-h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.repartitionCategories}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none"
                >
                  {data.repartitionCategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${value.toLocaleString('fr-FR')} FBU`}
                  contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {data.repartitionCategories.map((cat: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-semibold text-slate-900">{formatMGA(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TABLEAU TOP PRODUITS --- */}
      <TopProductsWidget products={data.topProduits} />

    </div>
  );
}