import { callBackend } from '../../../shared/lib/tauri';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { Medicament } from "../types";

const mapProduitToMedicament = (p: any): Medicament => ({
    id: p.id,
    nom: p.nom,
    dci: p.dci || '',
    forme: p.forme || '',
    prixAchat: p.prixAchat,
    prixVente: p.prixVente,
    seuilAlerte: p.seuilAlerte,
    categorie: p.categorie || 'Autre',
    imageUrl: p.imagePath ? convertFileSrc(p.imagePath) : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
    // ✅ On utilise les VRAIS lots renvoyés par Rust
    lots: (p.lots || []).map((l: any) => ({
        id: l.id,
        numeroLot: l.numeroLot,
        quantite: l.quantite,
        datePeremption: l.datePeremption,
    })),
});

// L'extractStockData n'est plus utilisé (plus besoin de calculer)
// Les achats créeront les lots directement

export const medicamentApi = {
    getMedicaments: async (): Promise<Medicament[]> => {
        const produits = await callBackend<any[]>('list_produits');
        return produits.map(mapProduitToMedicament);
    },

    createMedicament: async (data: any, imagePath?: string | null): Promise<Medicament> => {
        // Le stock initial sera 0 (les lots seront créés via les achats)
        const rustPayload = {
            nom: data.nom,
            dci: data.dci || null,
            forme: data.forme || null,
            categorie: data.categorie || null,
            prixAchat: data.prixAchat,
            prixVente: data.prixVente,
            stock: 0,  // 👈 forcé à 0 à la création
            seuilAlerte: data.seuilAlerte,
            datePeremption: null,
            imagePath: imagePath || null
        };

        const newProduit = await callBackend<any>('create_produit', { data: rustPayload });
        return mapProduitToMedicament(newProduit);
    },

    updateMedicament: async (id: string, data: any, imagePath?: string | null): Promise<Medicament> => {
        // On ne touche pas au stock ici (il est géré par les lots)
        const rustPayload = {
            nom: data.nom,
            dci: data.dci || null,
            forme: data.forme || null,
            categorie: data.categorie || null,
            prixAchat: data.prixAchat,
            prixVente: data.prixVente,
            stock: 0, // 👈 ignoré côté Rust (calculé depuis les lots)
            seuilAlerte: data.seuilAlerte,
            datePeremption: null,
            imagePath: imagePath || data.imageUrl || null
        };

        const updatedProduit = await callBackend<any>('update_produit', { id, data: rustPayload });
        return mapProduitToMedicament(updatedProduit);
    },

    deleteMedicament: async (id: string): Promise<void> => {
        return callBackend<void>('delete_produit', { id });
    },

    getLotsByProduit: async (produitId: string): Promise<any[]> => {
        return callBackend<any[]>('list_lots_by_produit', { produitId });
    },
    
    // ✅ NOUVELLES MÉTHODES : gestion des lots
    createLot: async (data: any): Promise<any> => {
        return callBackend<any>('create_lot', { data });
    },

    updateLot: async (id: string, data: any): Promise<any> => {
        return callBackend<any>('update_lot', { id, data });
    },

    deleteLot: async (id: string): Promise<void> => {
        return callBackend<void>('delete_lot', { id });
    },

    ajusterLotInventaire: async (lotId: string, nouvelleQuantite: number): Promise<void> => {
        return callBackend<void>('ajuster_lot_inventaire', { lotId, nouvelleQuantite });
    },
};