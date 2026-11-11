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
  },

    /**
   * Récupère l'historique des ventes d'un vendeur.
   */
  getVentesByUser: async (userId: string): Promise<any[]> => {
    return callBackend<any[]>('list_ventes_by_user', { userId });
  },

  /**
   * Récupère le détail d'une vente (avec ses lignes).
   */
  getVenteDetail: async (id: string): Promise<any> => {
    return callBackend<any>('get_vente_detail', { id });
  },
};