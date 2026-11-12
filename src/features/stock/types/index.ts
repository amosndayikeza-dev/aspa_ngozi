/**
 *  les caretegoris des medicaments
 */

export type CategorieMedicament = 'Antibiotique'| 'Antiparasitaire' | 'Vaccin' | 'Veterinaire' | 'Aliment' | 'Autre';

/** les formes galeniques */
export type FormeMedicament = 'Comprime' | 'Sirop' | 'Injection' | 'Pommade' | 'Poudre' | 'Autre';

/**
 * represente un lot specifique d'un medicament
 * permet de gerer la peremption (FEFO : fIRST expired, First out)
 */

export interface Lot{
    id: string;
    numeroLot:string;
    quantite: number;
    datePeremption: string; 
    joursRestants?: number;   
    statut?: string;  
}

/**
 * Represente un medicament dans le catalogue
 */

export interface Medicament {
    id: string;
    nom: string;
    dci: string 
    categorie: CategorieMedicament;
    forme: FormeMedicament;
    prixAchat: number;
    prixVente: number;
    seuilAlerte: number;
    lots: Lot[];
    imageUrl?: string;
    stock?: number;           // Stock total (tous lots)
    stockValide?: number;     // Stock vendable (hors périmés)
    stockPerime?: number;     // Stock à jeter
    datePeremption?: string;
  
}

/** Représente un fournisseur */
export interface Fournisseur {
  id: string;
  nom: string;
  telephone: string;
  email: string;
}

/** Une ligne de commande chez un fournisseur */
export interface LigneAchat {
  medicamentId: string;
  nomMedicament: string;
  numeroLot: string;
  quantite: number;
  prixAchatUnitaire: number;
  datePeremption: string;
}