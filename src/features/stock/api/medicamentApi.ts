import { resolve, Resolver } from "node:dns";
import type { Medicament } from "../types";

/**
 * Base des donnees fictives
 */
const MOCK_MEDICAMENTS: Medicament[] = [
    {
        id: 'MED-001',
        nom: 'Amoxicilline 500mg',
        dci: 'Amoxicilline',
        categorie: 'Antibiotique',
        forme: 'Comprime',
        prixAchat: 1500,
        prixVente: 2500,
        seuilAlerte: 10,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
        lots: [
            {
                id: 'LOT-001',
                numeroLot: 'AMX-2026-A',
                quantite: 45,
                datePeremption: '2026-12-31'
            },
            {
                id: 'LOT-002',
                numeroLot: 'AMX-2025-B',
                quantite: 5,
                datePeremption: '2025-10-15'
            }
        ]
    },
    {
        id: 'MED-002',
        nom: 'Ivermectine 1%',
        dci: 'Ivermectine',
        categorie: 'Antiparasitaire',
        forme: 'Injection',
        prixAchat: 8000,
        prixVente: 12000,
        seuilAlerte: 5,
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&q=80',
        lots: [
            {
                id: 'LOT-003',
                numeroLot: 'IVM-2027-X',
                quantite: 2,
                datePeremption: '2027-05-20'
            }
        ]
    },
    {
        id: 'MED-003',
        nom: 'Vaccin Newcastle',
        dci: 'Vaccin NDV',
        categorie: 'Vaccin',
        forme: 'Injection',
        prixAchat: 5000,
        prixVente: 8500,
        seuilAlerte: 20,
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&q=80',
        lots: [
            {
                id: 'LOT-004',
                numeroLot: 'VAC-2024-Z',
                quantite: 50,
                datePeremption: '2024-01-01'
            }
        ]
    }
];

export const medicamentApi = {

    /**
     * recupere tout les medicaments
     */

    getMedicaments: async (): Promise<Medicament[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_MEDICAMENTS), 500);
        });
    },

    //enregistrer un medicament
    createMedicament: async (data: any): Promise<Medicament> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ ...data, id: `MED-${Math.floor(Math.random() * 10000)}` }), 500);
        });
    },

    //modifier un medicament
    updateMedicament: async (id: string, data: any): Promise<Medicament> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ id, ...data }), 500);
        });
    },

    //supprimer un medicament
    deleteMedicament: async (id: string): Promise<void> => {
        return new Promise((resolve) => setTimeout(() => resolve(), 500));
    }
};