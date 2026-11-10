import { callBackend } from '../../../shared/lib/tauri';

export const venteApi = {
  /**
   * Enregistre une nouvelle vente.
   * @param data Doit contenir : clientId, animalId (optionnel), userId, modePaiement, lignes[]
   */
  createVente: async (data: {
    clientId: string;
    animalId?: string | null;
    userId: string;
    modePaiement: string;
    lignes: { produitId: string; quantite: number; prixUnitaire: number }[];
  }) => {
    return callBackend<any>('create_vente', { data });
  },

  /**
   * Récupère l'historique des ventes.
   */
  getHistoriqueVentes: async () => {
    return callBackend<any[]>('list_ventes');
  }
};