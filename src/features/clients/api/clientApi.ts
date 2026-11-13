import { callBackend } from '../../../shared/lib/tauri';
import type { Client, Animal } from '../types';

/**
 * Transforme les données brutes renvoyées par Rust vers l'interface `Client`.
 */
const mapClient = (c: any): Client => ({
  ...c,
  dateInscription: c.createdAt || new Date().toISOString(),
  // ✅ On crée un tableau de la taille de `animauxCount` (envoyé par Rust)
  // Cela permet à `client.animaux.length` d'afficher le bon nombre dans la liste.
  animaux: Array.from({ length: c.animauxCount || 0 }).map((_, i) => ({
    id: `virtual-${i}`,
    clientId: c.id,
    nom: 'Chargement...',
    espece: '',
    race: null,
    sexe: null,
    dateNaissance: null,
    poidsKg: null,
    createdAt: new Date().toISOString(),
  } as unknown as Animal)),
});

export const clientApi = {
  /**
   * Récupère la liste de tous les clients.
   */
  getClients: async (): Promise<Client[]> => {
    const clients = await callBackend<any[]>('list_clients');
    return clients.map(mapClient);
  },

  /**
   * Récupère un client spécifique par son ID.
   */
  getClientById: async (id: string): Promise<Client> => {
    const c = await callBackend<any>('get_client', { id });
    return mapClient(c);
  },

  /**
   * Crée un nouveau client.
   */
  createClient: async (data: Omit<Client, 'id' | 'dateInscription' | 'animaux'>): Promise<Client> => {
    const c = await callBackend<any>('create_client', { data });
    return mapClient(c);
  },

  /**
   * Met à jour un client existant.
   */
  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    const c = await callBackend<any>('update_client', { id, data });
    return mapClient(c);
  },

  /**
   * Supprime un client. (Ses animaux seront supprimés en cascade côté Rust)
   */
  deleteClient: async (id: string): Promise<void> => {
    return callBackend<void>('delete_client', { id });
  }
};