import { callBackend } from '../../../shared/lib/tauri';

export const detteApi = {
  /**
   * Liste toutes les dettes, avec filtres optionnels.
   */
  listDettes: async (statut?: string, clientId?: string): Promise<any[]> => {
    return callBackend<any[]>('list_dettes', { 
      statut: statut || null, 
      clientId: clientId || null 
    });
  },

  /**
   * Récupère une dette par son ID.
   */
  getDette: async (id: string): Promise<any> => {
    return callBackend<any>('get_dette', { id });
  },

  /**
   * Enregistre un versement sur une dette.
   */
  enregistrerPaiement: async (data: {
    detteId: string;
    montant: number;
    modePaiement: string;
    userId: string;
    notes?: string | null;
  }): Promise<any> => {
    return callBackend<any>('enregistrer_paiement_dette', { data });
  },

  /**
   * Récupère l'historique des paiements d'une dette.
   */
  listPaiements: async (detteId: string): Promise<any[]> => {
    return callBackend<any[]>('list_paiements_dette', { detteId });
  },

  /**
   * Total des créances en cours (dashboard).
   */
  getTotalCreances: async (): Promise<number> => {
    return callBackend<number>('get_total_creances');
  },

  /**
   * Total dû par un client spécifique (pour badge).
   */
  getTotalDuByClient: async (clientId: string): Promise<number> => {
    return callBackend<number>('get_total_du_by_client', { clientId });
  },

  getNbDettesRetard: async (): Promise<number> => {
    return callBackend<number>('get_nb_dettes_retard');
  },
};