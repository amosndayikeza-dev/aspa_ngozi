import { useState, useEffect } from 'react';
import { 
  BarChart3, Download, TrendingUp, TrendingDown, 
  Wallet, PieChart, Users, Loader2 // <-- Ajout de Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { reportApi } from '../api/reportApi';
import type { ReportData } from '../types';
import { callBackend } from '@/shared/lib/tauri'; 
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

export function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // NOUVEL ÉTAT : Pour gérer le chargement de l'export
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    reportApi.getReportData().then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  // --- FONCTION D'EXPORT OPTIMISÉE ---
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const path = await callBackend<string>('export_ventes_csv');
      console.log("✅ Export réussi :", path);
      
      // On utilise le nom du fichier renvoyé par Rust pour le message
      // (ex: "C:\Users\...\Bureau\ventes_2026.csv" -> "ventes_2026.csv")
      const fileName = path.split(/[/\\]/).pop(); 
      
      toast.success("Export CSV réussi", {
          description: `Le fichier ${fileName} a été généré.`,
          duration: 6000,
      });
    } catch (e: any) {
      console.error("❌ Erreur export :", e);
      const message = typeof e === 'string' ? e : e?.message || "Erreur inconnue";
      toast.error("Erreur d'export", {
          description: message.substring(0, 100),
          duration: 6000,
      });
    } finally {
      setIsExporting(false); // On arrête le loader
    }
  };

  if (isLoading || !data) {
    return <div className="p-10 text-xs font-medium text-slate-400 animate-pulse">Génération des rapports en cours...</div>;
  }

  const formatMGA = (val: number) => `${(val / 1000000).toFixed(1)}M FBU`;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Rapports Financiers
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Analysez la rentabilité et les performances de votre pharmacie.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm">
            <option>6 derniers mois</option>
            <option>Cette année</option>
            <option>Année précédente</option>
          </select>

          {/* BOUTON D'EXPORT MIS À JOUR */}
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> 
                Exportation...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> 
                Exporter CSV
              </>
            )}
          </button>
        </div>
      </div>

            {/* --- CARTES KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-4 rounded-xl shadow-md text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-2 bg-white/10 rounded-lg text-emerald-400"><Wallet className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-3 relative z-10">
                        <p className="text-[11px] font-medium text-slate-400">Profit Net Total</p>
                        <p className="text-xl font-bold mt-0.5">
                            {data.kpis.totalProfit.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FBU</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><PieChart className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-medium text-slate-500">Marge Moyenne</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">{data.kpis.margeMoyenne.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-medium text-slate-500">Total Revenus</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">
                            {data.kpis.totalRevenus.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FBU</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><TrendingDown className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-medium text-slate-500">Total Dépenses</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">
                            {data.kpis.totalDepenses.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FBU</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* --- GRAPHIQUES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                
                {/* Graphique Barres */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-slate-900">Revenus vs Dépenses</h2>
                    </div>
                    <div className="flex-1 min-h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.historiqueMensuel} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000000}M`} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                    formatter={(value: any) => `${Number(value ?? 0).toLocaleString('fr-FR')} FBU`}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance des Vendeurs */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" /> Performance Vendeurs
                    </h2>
                    <div className="space-y-5 flex-1">
                        {data.performanceVendeurs.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 italic py-6">
                                Aucun vendeur enregistré.
                            </div>
                        ) : (
                            data.performanceVendeurs.map((vendeur, index) => {
                                const pourcentage = Math.min((vendeur.ventes / vendeur.objectif) * 100, 100);
                                const isObjectifAtteint = pourcentage >= 100;

                                return (
                                    <div key={index}>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{vendeur.nom}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {formatMGA(vendeur.ventes)} / {formatMGA(vendeur.objectif)}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                                isObjectifAtteint ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {pourcentage.toFixed(0)}%
                                            </span>
                                        </div>
                                        
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000", 
                                                    isObjectifAtteint ? "bg-emerald-500" : "bg-blue-500"
                                                )}
                                                style={{ width: `${pourcentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider">
                            Objectifs fixés par le pharmacien
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}