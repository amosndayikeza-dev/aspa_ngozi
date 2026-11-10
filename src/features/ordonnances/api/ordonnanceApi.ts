import { callBackend } from '../../../shared/lib/tauri';
import type { Ordonnance } from "../types";

export const ordonnanceApi = {
    /**
     * Récupère toutes les ordonnances avec les noms des clients/animaux/vétérinaires
     */
    getOrdonnances: async (): Promise<Ordonnance[]> => {
        return callBackend<Ordonnance[]>('list_ordonnances');
    },

    /**
     * Crée une nouvelle ordonnance
     */
    createOrdonnance: async (data: any): Promise<void> => {
        return callBackend<void>('create_ordonnance', { data });
    },

    getOrdonnanceById: async (id: string): Promise<Ordonnance> => {
        return callBackend<Ordonnance>('get_ordonnance', { id });
    }

};