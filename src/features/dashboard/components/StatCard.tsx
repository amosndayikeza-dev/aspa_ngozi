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
}

const iconBgVariants = {
  teal: 'bg-brand-dark text-white',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-vet-danger text-white',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, iconColor = 'teal' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      
      <div className="flex justify-between items-start ">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-0xl font-extrabold text-gray-800">{value}</h3>
        </div>
        
        {/* Icône avec fond coloré */}
        <div className={cn("p-3 rounded-xl", iconBgVariants[iconColor])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Tendance et sous-titre */}
      <div className="mt-4 flex items-center justify-between text-xs">
        {trend && (
          <span className={cn(
            "flex items-center font-bold px-2 py-1 rounded-md",
            trend.isPositive ? "bg-green-50 text-vet-success" : "bg-red-50 text-vet-danger"
          )}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend.value}
          </span>
        )}
        {subtitle && <span className="text-gray-400 font-medium">{subtitle}</span>}
      </div>

    </div>
  );
}