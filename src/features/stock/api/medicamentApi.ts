// ✅ 1. On importe convertFileSrc depuis Tauri
import { convertFileSrc } from '@tauri-apps/api/core';
// ✅ 2. On importe callBackend depuis TON wrapper (vérifie que le chemin relatif est le bon)
import { callBackend } from '../../../shared/lib/tauri';
import type { Medicament } from "../types";

const mapProduitToMedicament = (p: any): Medicament => ({
    id: p.id,
    nom: p.nom,
    dci: p.dci || '',
    forme: p.forme || '',
    prixAchat: p.prixAchat,
    prixVente: p.prixVente,
    seuilAlerte: p.seuilAlerte,
    categorie: p.categorie || 'Autre', // ✅ On récupère la vraie catégorie
    imageUrl: p.imagePath ? convertFileSrc(p.imagePath) : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
    lots: (p.stock > 0 || p.datePeremption) ? [{
        id: `LOT-${p.id}`,
        numeroLot: `LOT-${p.id}`,
        quantite: p.stock,
        datePeremption: p.datePeremption || '2099-12-31'
    }] : []
});

const extractStockData = (data: any) => {
    const stock = data.lots?.reduce((sum: number, lot: any) => sum + lot.quantite, 0) || 0;
    const datePeremption = data.lots?.[0]?.datePeremption || null;
    return { stock, datePeremption };
};

export const medicamentApi = {
    getMedicaments: async (): Promise<Medicament[]> => {
        const produits = await callBackend<any[]>('list_produits');
        return produits.map(mapProduitToMedicament);
    },

    createMedicament: async (data: any, imagePath?: string | null): Promise<Medicament> => {
        const { stock, datePeremption } = extractStockData(data);
        
        const rustPayload = {
            nom: data.nom,
            dci: data.dci || null,
            forme: data.forme || null,
            categorie: data.categorie || null,
            prixAchat: data.prixAchat,
            prixVente: data.prixVente,
            stock: stock,
            seuilAlerte: data.seuilAlerte,
            datePeremption: datePeremption,
            imagePath: imagePath || null
        };

        const newProduit = await callBackend<any>('create_produit', { data: rustPayload });
        return mapProduitToMedicament(newProduit);
    },

    updateMedicament: async (id: string, data: any, imagePath?: string | null): Promise<Medicament> => {
        const { stock, datePeremption } = extractStockData(data);

        const rustPayload = {
            nom: data.nom,
            dci: data.dci || null,
            forme: data.forme || null,
            categorie: data.categorie || null,
            prixAchat: data.prixAchat,
            prixVente: data.prixVente,
            stock: stock,
            seuilAlerte: data.seuilAlerte,
            datePeremption: datePeremption,
            imagePath: imagePath || data.imagePath || null
        };

        const updatedProduit = await callBackend<any>('update_produit', { id, data: rustPayload });
        return mapProduitToMedicament(updatedProduit);
    },

    deleteMedicament: async (id: string): Promise<void> => {
        return callBackend<void>('delete_produit', { id });
    }
};