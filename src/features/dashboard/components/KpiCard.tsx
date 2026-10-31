import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  // Variante pour créer l'effet "Bento" (carte noire au milieu des blanches)
  variant?: 'default' | 'dark';
}

export function KpiCard({ title, value, unit, icon: Icon, trend, variant = 'default' }: KpiCardProps) {
  const isDark = variant === 'dark';

  return (
    <div className={cn(
      "relative p-4 rounded-xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-200",
      isDark 
        ? "bg-slate-900 border-slate-800 text-white shadow-md" 
        : "bg-white border-slate-200/90 text-slate-900 hover:shadow-md hover:border-emerald-200"
    )}>
      
      {/* Effet de halo lumineux (uniquement sur la carte noire) */}
      {isDark && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      )}

      {/* En-tête de la carte : Icône et Tendance */}
      <div className="flex justify-between items-start relative z-10">
        <div className={cn(
          "p-2 rounded-lg",
          isDark ? "bg-white/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        
        {trend && (
          <span className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded",
            trend.isPositive 
              ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600")
              : (isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-50 text-rose-600")
          )}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>

      {/* Valeur principale */}
      <div className="mt-3 relative z-10">
        <p className={cn("text-[11px] font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
          {title}
        </p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <p className="text-xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {unit && (
            <span className={cn("text-xs font-medium", isDark ? "text-slate-500" : "text-slate-400")}>
              {unit}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}