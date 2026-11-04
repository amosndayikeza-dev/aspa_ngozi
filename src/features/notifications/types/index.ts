export type NotificationType =  'STOCK' | 'PEREMPTION' | 'SYSTEME' | 'VENTE';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    date: string;
    isRead: boolean;
}