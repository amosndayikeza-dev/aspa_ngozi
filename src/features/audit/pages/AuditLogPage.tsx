import { useState, useEffect } from 'react';
import { ShieldCheck, PlusCircle, Edit, Trash2, LogIn, Clock, Filter } from 'lucide-react';
import { auditApi } from '../api/auditApi';
import type { AuditLog, AuditAction } from '../types';
import { cn } from '@/shared/lib/cn';

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AuditAction | 'ALL'>('ALL');

  useEffect(() => {
    auditApi.getLogs().then(data => {
      setLogs(data);
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);

  // Configuration visuelle selon l'action
  const actionConfig = {
    CREATE: { icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Création' },
    UPDATE: { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Modification' },
    DELETE: { icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Suppression' },
    LOGIN: { icon: LogIn, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Connexion' },
  };

  if (isLoading) return <div className="p-10 text-xs font-medium text-slate-400 animate-pulse">Chargement du journal...</div>;

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-4">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Journal d'Audit
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Historique complet des actions effectuées sur le système.
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-sm w-fit">
        <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
        {(['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors",
              filter === f ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {f === 'ALL' ? 'Tout' : actionConfig[f].label}
          </button>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
        <div className="relative border-l border-slate-200 ml-3 space-y-6">
          {filteredLogs.map((log) => {
            const config = actionConfig[log.action];
            const Icon = config.icon;
            
            return (
              <div key={log.id} className="relative pl-6">
                {/* Point sur la ligne */}
                <div className={cn(
                  "absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
                  config.bg
                )}>
                  <Icon className={cn("w-3.5 h-3.5", config.color)} />
                </div>
                
                {/* Contenu de l'événement */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{log.userNom}</span>
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", config.bg, config.color)}>
                        {log.userRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(log.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1">
                    <span className="font-semibold">{config.label}</span> dans le module <span className="font-semibold">{log.module}</span>.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}