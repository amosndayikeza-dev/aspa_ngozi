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
}

/**
 * Represente un medicament dans le catalogue
 */

export interface Medicament {
    id: string;
    nom: string;
    dci: string // Denomination Commune Internationale
    categorie: CategorieMedicament;
    forme: FormeMedicament;
    prixAchat: number;
    prixVente: number;
    seuilAlerte: number;
    lots: Lot[];
    imageUrl?: string;
}

/** Représente un fournisseur */
export interface Fournisseur {
  id: string;
  nom: string;
}

/** Une ligne de commande chez un fournisseur */
export interface LigneAchat {
  medicamentId: string;
  nomMedicament: string;
  quantite: number;
  prixAchatUnitaire: number;
}