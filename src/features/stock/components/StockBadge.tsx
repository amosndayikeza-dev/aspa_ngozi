import { cn } from '@/shared/lib/cn';

interface StockBadgeProps {
    quantite: number;
    seuil: number;
    datePeremption?: string;
}

export function StockBadge({ quantite, seuil, datePeremption }: StockBadgeProps) {
    // 1. Vérification de la date de péremption
    if (datePeremption) {
        const isExpired = new Date(datePeremption) < new Date();
        if (isExpired) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                    </span>
                    Périmé
                </span>
            );
        }
    }

    // 2. Rupture de stock
    if (quantite === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/90 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                Rupture
            </span>
        );
    }

    // 3. Stock faible (Alerte seuil)
    if (quantite <= seuil) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                Stock faible
            </span>
        );
    }

    // 4. Stock suffisant
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            En stock
        </span>
    );
}