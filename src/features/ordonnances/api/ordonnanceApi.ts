import { resolve } from "node:dns";
import type { Ordonnance } from "../types";

const MOCK_ORDONNANCES: Ordonnance[] =[
    {
        
        id: 'ORD-2026-001',
        date: '2026-10-28T10:30:00.000Z',
        clientNom: 'Rakoto Jean',
        animalNom: 'Rex',
        animalEspece: 'Chien',
        veterinaireNom: 'Dr. Rabe',
        lignes: [
        { medicamentId: 'MED-001', nomMedicament: 'Amoxicilline 500mg', posologie: '1 comprimé matin et soir', duree: '7 jours', quantite: 14 },
        ]
    },
    {
        id: 'ORD-2026-002',
        date: '2026-10-29T14:15:00.000Z',
        clientNom: 'Randria Sarah',
        animalNom: 'Bella',
        animalEspece: 'Chien',
        veterinaireNom: 'Dr. Rakoto',
        lignes: [
        { medicamentId: 'MED-002', nomMedicament: 'Ivermectine 1%', posologie: '1 injection sous-cutanée', duree: '1 jour', quantite: 1 },
        ]
    }
];

export const ordonnanceApi = {
    getOrdonnances: async (): Promise<Ordonnance[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDONNANCES), 500));
    }
};