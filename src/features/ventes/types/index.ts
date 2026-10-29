import type { Medicament } from '@/features/stock/types';

/** une ligne dans le panier (un medicament + sa quantite) */
export interface LignePanier{
    medicament: Medicament;
    quantite: number;
}

/** ----- le mode de paiement d'une vente finalise */
export type ModePaiement = 'Espèces' | 'Credit' ;

/** la structure d'une vente finalise */
export interface vente{
    id: string;
    clientId?: string;
    date: string;
    lignes: LignePanier[];
    total: number;
    modePaiement: ModePaiement;
    vendeurId: string;
}