import { resolve } from "node:dns";
import type { Notification } from "../types";

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'STOCK',
        title: 'Rupture de stock',
        message: "L'Ivermectine 1% est en rupture de stock.",
        date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isRead: false
    },
    {
        id: '2',
        type: 'PEREMPTION',
        title: 'Lot bientôt périmé',
        message: 'Le lot AMX-2025-B expire dans 12 jours.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: false
    },
    {
        id: '3',
        type: 'SYSTEME',
        title: 'Mise à jour disponible',
        message: 'La version 1.2.0 Aspa NGOZI est prête.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true
    },
];

export const notificationApi = {
    getNotifications: async (): Promise<Notification[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_NOTIFICATIONS), 300));
    }
};