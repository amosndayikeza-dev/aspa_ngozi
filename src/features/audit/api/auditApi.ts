import { resolve } from "node:dns";
import type { AuditLog } from "../types";

const MOCK_LOGS: AuditLog[] = [
    {
        id: '1',
        date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userNom: 'Rakoto Jean',
        userRole: 'PHARMACIEN',
        action: 'CREATE',
        module: 'Stock',
        details: 'A ajouté le médicament Amoxicilline 500mg'
    },
    {
        id: '2',
        date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        userNom: 'Randria Sarah',
        userRole: 'VENDEUR',
        action: 'UPDATE',
        module: 'Clients',
        details: 'A modifié le numéro de téléphone de Rakoto Jean'
    },
    {
        id: '3',
        date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        userNom: 'Rakoto Jean',
        userRole: 'PHARMACIEN',
        action: 'DELETE',
        module: 'Fournisseurs',
        details: 'A supprimé le fournisseur Local Grossiste'
    },
    {
        id: '4',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        userNom: 'Admin Système',
        userRole: 'ADMIN',
        action: 'LOGIN',
        module: 'Système',
        details: 'S\'est connecté au système'
    },
];

export const auditApi = {
    getLogs: async (): Promise<AuditLog[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_LOGS), 400));
    }
};