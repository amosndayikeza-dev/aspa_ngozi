// src/features/dashboard/components/StatCard.tsx
import { cn } from '@/shared/lib/cn';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: 'teal' | 'blue' | 'purple' | 'red';
  sparkline?: 'up' | 'down' | 'steady';
  progress?: {
    percent: number;
    label?: string;
  };
}

const colorThemes = {
  teal: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/70 group-hover:bg-emerald-600 group-hover:text-white',
    accentBorder: 'hover:border-emerald-400/50',
    sparklineStroke: '#10B981',
    progressBg: 'bg-emerald-500',
  },
  blue: {
    iconBg: 'bg-sky-50 text-sky-600 border-sky-200/70 group-hover:bg-sky-600 group-hover:text-white',
    accentBorder: 'hover:border-sky-400/50',
    sparklineStroke: '#0EA5E9',
    progressBg: 'bg-sky-500',
  },
  purple: {
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/70 group-hover:bg-indigo-600 group-hover:text-white',
    accentBorder: 'hover:border-indigo-400/50',
    sparklineStroke: '#6366F1',
    progressBg: 'bg-indigo-500',
  },
  red: {
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200/70 group-hover:bg-rose-600 group-hover:text-white',
    accentBorder: 'hover:border-rose-400/50',
    sparklineStroke: '#EF4444',
    progressBg: 'bg-rose-500',
  },
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  iconColor = 'teal',
  sparkline,
  progress 
}: StatCardProps) {
  const theme = colorThemes[iconColor];

  return (
    <div className={cn(
      "bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]",
      "hover:shadow-md transition-all duration-200 group flex flex-col justify-between relative overflow-hidden",
      theme.accentBorder
    )}>
      
      {/* En-tête : Titre & Icône micro-badge */}
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-lg xl:text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums leading-tight">
            {value}
          </h3>
        </div>
        
        {/* Micro-badge icône */}
        <div className={cn("p-2 rounded-lg border transition-all duration-200 shrink-0", theme.iconBg)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Micro-data-visualisation : Sparkline ou Jauge */}
      {sparkline && (
        <div className="my-1.5 flex items-center justify-between">
          <div className="w-full flex justify-end">
            <svg className="w-20 h-6 overflow-visible" viewBox="0 0 64 24">
              {sparkline === 'up' ? (
                <>
                  <path 
                    d="M 2 20 Q 16 18 28 12 T 48 8 T 62 3" 
                    fill="none" 
                    stroke={theme.sparklineStroke} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <circle cx="62" cy="3" r="2" fill={theme.sparklineStroke} />
                </>
              ) : (
                <>
                  <path 
                    d="M 2 4 Q 18 8 30 16 T 48 18 T 62 21" 
                    fill="none" 
                    stroke={theme.sparklineStroke} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <circle cx="62" cy="21" r="2" fill={theme.sparklineStroke} />
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {progress && (
        <div className="mt-2 pt-1 border-t border-slate-100">
          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
            <span>{progress.label || 'Objectif'}</span>
            <span className="font-mono font-semibold text-slate-700">{progress.percent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", theme.progressBg)} 
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }} 
            />
          </div>
        </div>
      )}

      {/* Pied : Tendance & Sous-titre */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
        {trend ? (
          <span className={cn(
            "inline-flex items-center font-bold px-1.5 py-0.5 rounded font-mono",
            trend.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-rose-50 text-rose-700 border border-rose-200/60"
          )}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5 text-rose-600" />}
            {trend.value}
          </span>
        ) : (
          <span className="text-slate-400 font-medium">Suivi temps réel</span>
        )}
        {subtitle && (
          <span className="text-slate-400 font-medium truncate max-w-[150px] text-right">
            {subtitle}
          </span>
        )}
      </div>

    </div>
  );
}