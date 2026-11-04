import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Database, Users, Server, Activity, 
  Settings, ArrowRight, Clock, FileText 
} from 'lucide-react';
import type { User as UserType } from '@/features/auth/types';
import { cn } from '@/shared/lib/cn';

export function AdminDashboard({ user }: { user: UserType }) {
  const navigate = useNavigate();

  // Données mockées système
  const systemStats = {
    usersActifs: 3,
    tailleDB: '2.4 MB',
    uptime: '99.9%',
    version: 'v1.0.0-beta'
  };

  const recentLogs = [
    { action: 'Connexion réussie', user: 'Rakoto Jean', time: 'Il y a 5 min', type: 'SUCCESS' },
    { action: 'Modification des paramètres', user: 'Admin Système', time: 'Il y a 2 heures', type: 'INFO' },
    { action: 'Échec de connexion', user: 'inconnu@mail.com', time: 'Il y a 3 heures', type: 'WARNING' },
  ];

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto pb-10">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" /> Console d'Administration
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Bienvenue <span className="font-semibold text-slate-700">{user.nom}</span>. État du système et sécurité.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" /> Système Opérationnel
        </div>
      </div>

      {/* --- KPIs SYSTÈME --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Utilisateurs Actifs</span>
          </div>
          <p className="text-xl font-black text-slate-900">{systemStats.usersActifs}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Base de données</span>
          </div>
          <p className="text-xl font-black text-slate-900">{systemStats.tailleDB}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Server className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Uptime (30j)</span>
          </div>
          <p className="text-xl font-black text-slate-900">{systemStats.uptime}</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl shadow-md text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl -mr-5 -mt-5" />
          <div className="flex items-center gap-2 text-slate-400 mb-2 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Version App</span>
          </div>
          <p className="text-xl font-black font-mono relative z-10">{systemStats.version}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* --- TIMELINE DES LOGS RÉCENTS --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Sécurité & Logs récents
            </h3>
            <button onClick={() => navigate('/audit')} className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              Journal complet <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full ring-4",
                    log.type === 'SUCCESS' ? "bg-emerald-500 ring-emerald-50" :
                    log.type === 'WARNING' ? "bg-rose-500 ring-rose-50" : "bg-blue-500 ring-blue-50"
                  )} />
                </div>
                <div className="flex-1 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-slate-900">{log.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-slate-500">Par <span className="font-semibold text-slate-700">{log.user}</span></p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {log.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RACCOURCIS D'ADMINISTRATION --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" /> Outils de gestion
          </h3>
          
          <div className="grid grid-cols-1 gap-2 flex-1">
            <button onClick={() => navigate('/utilisateurs')} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Gestion des Utilisateurs</p>
                  <p className="text-[10px] text-slate-500">Créer, modifier ou révoquer des accès</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button onClick={() => navigate('/parametres')} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Paramètres Système</p>
                  <p className="text-[10px] text-slate-500">Configuration de la pharmacie et du ticket</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button onClick={() => navigate('/audit')} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Journal d'Audit</p>
                  <p className="text-[10px] text-slate-500">Surveiller l'activité du système</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}