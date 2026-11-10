import { callBackend } from '../../../shared/lib/tauri';
import type { Fournisseur } from '../types';

export const achatApi = {
  /**
   * Récupère la liste des fournisseurs depuis la base SQLite.
   */
  getFournisseurs: async (): Promise<Fournisseur[]> => {
    return callBackend<Fournisseur[]>('list_fournisseurs');
  },
  
  /**
   * Crée un nouveau fournisseur.
   */
  createFournisseur: async (data: Omit<Fournisseur, 'id'>): Promise<Fournisseur> => {
    // On envoie { data: { nom, contact, telephone, email } }
    return callBackend<Fournisseur>('create_fournisseur', { data });
  },

  /**
   * Met à jour un fournisseur existant.
   */
  updateFournisseur: async (id: string, data: Partial<Fournisseur>): Promise<Fournisseur> => {
    // On envoie { id, data: { ... } }
    return callBackend<Fournisseur>('update_fournisseur', { id, data });
  },

  /**
   * Supprime un fournisseur.
   */
  deleteFournisseur: async (id: string): Promise<void> => {
    return callBackend<void>('delete_fournisseur', { id });
  },

    /**
   * Crée un bon de commande (Achat).
   * Le backend Rust va automatiquement augmenter le stock des produits.
   */
  createAchat: async (data: any): Promise<any> => {
    // ✅ On traduit les données de React (medicamentId, prixAchatUnitaire) 
    // vers les données attendues par Rust (produitId, prixUnitaire)
    const rustPayload = {
      fournisseurId: data.fournisseurId,
      lignes: data.lignes.map((l: any) => ({
        produitId: l.medicamentId,
        quantite: l.quantite,
        prixUnitaire: l.prixAchatUnitaire
      }))
    };

    return callBackend<any>('create_achat', { data: rustPayload });
  }
};