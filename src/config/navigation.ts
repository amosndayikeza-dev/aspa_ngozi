import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    FileText,
    Package,
    Truck,
    ShieldCheck,
    Settings,
    BarChart3
 } from "lucide-react";
import type { UserRole } from '@/features/auth';
import { path } from "@tauri-apps/api";

export interface NavItem{
    label: string;
    path: string;
    icon: React.ElementType;
    allowedRoles: UserRole[];
}

export interface NavSection{
    title: string;
    items: NavItem[];
}

/**
 * Configuration global de la nvigation 
 * filtree dynamiquement par le sidebar selon le role de l'utilisateur
 */

export const NAVIGATION_SECTIONS: NavSection[] = [
    {
        title: 'Menu Principal',
        items: [
            {
                label: 'Tableau de bord',
                path: '/dashboard',
                icon: LayoutDashboard,
                allowedRoles: ['PHARMACIEN', 'VENDEUR', 'ADMIN'],
            },
            {
                label: 'Point de Vente',
                path: '/vente',
                icon: ShoppingCart,
                allowedRoles: ['PHARMACIEN', 'VENDEUR']
            },
            {
                label: 'Clients & Animaux',
                path: '/clients',
                icon: Users,
                allowedRoles: ['PHARMACIEN', 'VENDEUR'],
            },
            {
                label: 'Ordonnances',
                path: '/ordonnances',
                icon: FileText,
                allowedRoles: ['PHARMACIEN', 'VENDEUR']
            },
        ],
    },
    {
        title: 'Gestion',
        items: [
            {
                label: 'Stock & Inventaire',
                path: '/stocks',
                icon: Truck,
                //seul de boss gere le stock physique
                allowedRoles: ['PHARMACIEN'],
            },
            {
                label: 'Achats Fournisseurs',
                path: '/achats',
                icon: Truck,
                allowedRoles: ['PHARMACIEN'],
            },
            {
                label: 'Rapports',
                path: '/rapports',
                icon: BarChart3,
                allowedRoles: ['PHARMACIEN'],
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            {
                label: 'Utilisateur & Roles',
                path: '/utilisateurs',
                icon: ShieldCheck,
                allowedRoles: ['ADMIN', 'PHARMACIEN'],
            },
            {
                label: 'Parametres',
                path: '/parametres',
                icon: Settings,
                allowedRoles: ['ADMIN'],
            },
        ],
    },
];