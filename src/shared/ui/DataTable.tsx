import type { ReactNode } from "react";
import { cn } from '@/shared/lib/cn';

/**
 * Definition d'une colonne du tableau.
 * @template T le type des donnees de la ligne (ex: client,Medicament)
 */

export interface Column<T>{
    header: string; // simbolise le titre de la colonne
    accessorKey?: keyof T; //la cle de l'objet afficher
    render?: (item: T) => ReactNode; // fonction pour afficher une cellule complexe
    className?: string;
}

interface DataTableProps<T>{
    data: T[];
    Columns: Column<T>[];
    isLoading?: boolean;
    keyExtractor: (item: T) => string; //sert a identifier de maniere unique la ligne 
    onRowClick?: (item: T) => void;
}

/**
 * Tableau de donnees generique et reutilisable
 * concu pour un affichage dense (Desktop)
 */

export function DataTable<T>({
    data,
    Columns,
    isLoading,
    keyExtractor,
    onRowClick
}: DataTableProps<T>) {
    
    // 1. État de chargement (Skeleton haute précision)
    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden animate-pulse">
                <div className="h-9 bg-slate-100/70 border-b border-slate-200/80 flex items-center px-4 gap-4">
                    <div className="h-2.5 bg-slate-200/80 rounded w-24"></div>
                    <div className="h-2.5 bg-slate-200/60 rounded w-32"></div>
                    <div className="h-2.5 bg-slate-200/60 rounded w-20 ml-auto"></div>
                </div>
                <div className="divide-y divide-slate-100/80 p-0">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 px-4 flex items-center gap-4">
                            <div className="w-6 h-6 rounded-md bg-slate-100 shrink-0"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                            <div className="h-3 bg-slate-100/60 rounded w-1/5"></div>
                            <div className="h-3 bg-slate-100/60 rounded w-1/6 ml-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. État vide (Aucun résultat)
    if (data.length === 0) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-5 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-2.5 shadow-2xs">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <p className="text-xs font-semibold text-slate-800">Aucun résultat trouvé</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Essayez d'ajuster vos critères ou filtres de recherche.</p>
            </div>
        );
    }

    // 3. Rendu normal Haute Densité Desktop
    return (
        <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    {/* En-tête du tableau */}
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                            {Columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={cn(
                                        "px-3.5 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Corps du tableau */}
                    <tbody className="divide-y divide-slate-100/80">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "transition-colors duration-150 hover:bg-slate-50/70",
                                    onRowClick ? "cursor-pointer active:bg-slate-100/80" : ""
                                )}
                            >
                                {Columns.map((col, index) => (
                                    <td
                                        key={index}
                                        className={cn("px-3.5 py-2 text-xs text-slate-800", col.className)}
                                    >
                                        {col.render
                                            ? col.render(item)
                                            : col.accessorKey
                                                ? String(item[col.accessorKey] || '-')
                                                : '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
