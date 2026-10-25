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
    
    //1. etat de chargement (skeleton)
    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-8 bg-gray-100 rounded-md mb-4 w-1/4"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-50 rounded-lg mb-2"></div>
                ))}
            </div>
        );
    }

    //2. Etat vide (aucon resultat)
    if (data.length === 0) {
        return (
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-12 fllex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-gray-600">Aucun resultat trouve</p>
                <p className="text-xs text-gray-400 mt-1">Essayer de modifier vos criteres de recherche.</p>
            </div>
        );
    }

    //3. rendu normal
    return (
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    {/** en tete du tableau */}
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            {Columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={cn(
                                        "px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                            
                        </tr>
                    </thead>

                    {/** corps du tableau */}
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "hover:bg-brand-bg/50 transition-colors",
                                    onRowClick ? "cursor-pointer" : ""
                                )}
                            >
                                {Columns.map((col, index) => (
                                    <td
                                        key={index}
                                        className={cn("px-4 py-3 text-xs text-text-main", col.className)}
                                    >
                                        {/** si une fonction render est fournie, on l'utilise, sion on affiche la valuer brut */}
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
