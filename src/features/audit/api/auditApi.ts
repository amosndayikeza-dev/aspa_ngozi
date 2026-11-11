import { callBackend } from '../../../shared/lib/tauri';
import type { AuditLog } from "../types";

export const auditApi = {
    /**
     * Récupère l'historique des logs depuis la base de données.
     */
    getLogs: async (): Promise<AuditLog[]> => {
        return callBackend<AuditLog[]>('get_audit_logs');
    }
};