// src/features/dashboard/components/KpiCard.tsx
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: string; isPositive: boolean; };
  variant?: 'default' | 'dark';
  compact?: boolean; // <-- NOUVELLE PROP
}

export function KpiCard({ title, value, unit, icon: Icon, trend, variant = 'default', compact = false }: KpiCardProps) {
  const isDark = variant === 'dark';

  return (
    <div className={cn(
      "relative rounded-xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-200",
      // Si compact, on réduit le padding et on centre
      compact ? "p-2.5" : "p-4",
      isDark 
        ? "bg-slate-900 border-slate-800 text-white shadow-md" 
        : "bg-white border-slate-200/90 text-slate-900 hover:shadow-md hover:border-emerald-200"
    )}>
      
      {isDark && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
      )}

      <div className="flex justify-between items-start relative z-10">
        <div className={cn(
          "rounded-lg",
          compact ? "p-1.5" : "p-2",
          isDark ? "bg-white/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
        )}>
          <Icon className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </div>
        
        {trend && !compact && (
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

      <div className={cn("relative z-10", compact ? "mt-2" : "mt-3")}>
        <p className={cn("font-medium truncate", compact ? "text-[10px]" : "text-[11px]", isDark ? "text-slate-400" : "text-slate-500")}>
          {title}
        </p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <p className={cn("font-bold tracking-tight", compact ? "text-base" : "text-xl")}>
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {unit && (
            <span className={cn("font-medium", compact ? "text-[9px]" : "text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}