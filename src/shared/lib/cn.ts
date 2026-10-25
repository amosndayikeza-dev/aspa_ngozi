
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine des classes CSS conditionnelles en résolvant les conflits Tailwind.
 *
 * Exemple :
 *   cn('p-2', 'p-4')                 → 'p-4'
 *   cn('text-red-500', isActive && 'text-green-500') → dépend de isActive
 */

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}