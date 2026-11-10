import { callBackend } from '../../../shared/lib/tauri';
import type { Animal } from '../types';

export const animalApi = {
  /**
   * Récupère tous les animaux d'un client spécifique.
   */
  getAnimauxByClient: async (clientId: string): Promise<Animal[]> => {
    return callBackend<Animal[]>('list_animaux_by_client', { clientId });
  },

  /**
   * Crée un nouvel animal pour un client.
   */
  createAnimal: async (data: any): Promise<Animal> => {
    // data doit contenir clientId, nom, espece, race, sexe, dateNaissance, poidsKg
    return callBackend<Animal>('create_animal', { data });
  },

  /**
   * Modifie un animal existant.
   */
  updateAnimal: async (id: string, data: any): Promise<Animal> => {
    // ✅ On envoie bien { id, data } (data contient le clientId)
    return callBackend<Animal>('update_animal', { id, data });
  },

  /**
   * Supprime un animal.
   */
  deleteAnimal: async (id: string): Promise<void> => {
    return callBackend<void>('delete_animal', { id });
  }
};