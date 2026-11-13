
// ---------- LOTS ----------
export interface Lot {
  id: string;
  numeroLot: string;
  quantite: number;
  datePeremption: string; 
  joursRestants?: number;
}

// ---------- MÉDICAMENTS ----------
export interface Medicament {
  id: string;
  nom: string;
  dci: string;
  forme: string;
  categorie: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  imageUrl?: string | null;
  datePeremption?: string | null;
  // Stock — remplis par medicamentApi.mapProduitToMedicament
  stock: number;
  stockValide: number;
  stockPerime: number;
  lots: Lot[];
}

export interface MedicamentFormData {
  nom: string;
  dci?: string;
  forme?: string;
  categorie?: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
}

// ---------- FOURNISSEURS ----------
export interface Fournisseur {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  contact?: string | null;     // présent dans le schéma, optionnel côté UI
  createdAt?: string;
}

// ---------- ACHATS ----------

export interface AchatLigne {
  id?: string;
  produitId: string;
  produitNom?: string;        
  lotId?: string | null;
  numeroLot?: string | null;
  quantite: number;
  prixUnitaire: number;
  sousTotal?: number;
}

export interface Achat {
  id: string;
  fournisseurId: string;
  fournisseurNom?: string;    
  total: number;
  dateAchat: string;
  createdAt?: string;
  lignes?: AchatLigne[];
}

// Payload d'entrée (création d'achat)
export interface AchatPayload {
  fournisseurId: string;
  dateAchat?: string;
  lignes: AchatLigne[];
}