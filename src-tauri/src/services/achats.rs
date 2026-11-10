//! Logique métier des achats (Réapprovisionnement du stock).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneAchatInput {
    pub produit_id: String,
    pub quantite: i64,
    pub prix_unitaire: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AchatInput {
    pub fournisseur_id: String,
    pub lignes: Vec<LigneAchatInput>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AchatPayload {
    pub id: String,
    pub fournisseur_id: String,
    pub total: f64,
    pub date_achat: String,
}

/// Crée un achat et AUGMENTE le stock des produits (le tout dans une transaction).
pub fn create(conn: &mut Connection, input: AchatInput) -> Result<AchatPayload, AppError> {
    // 1. Démarrer la transaction
    let tx = conn.transaction()?;

    let id = format!("ACH-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    let date_achat = chrono::Local::now().format("%Y-%m-%d").to_string();
    
    // Calculer le total
    let total: f64 = input.lignes.iter().map(|l| l.quantite as f64 * l.prix_unitaire).sum();

    // 2. Insérer l'achat
    tx.execute(
        "INSERT INTO achats (id, fournisseur_id, total, date_achat, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![id, input.fournisseur_id, total, date_achat, now],
    )?;

    // 3. Insérer les lignes et mettre à jour le stock
    for ligne in input.lignes {
        let ligne_id = format!("L-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        
        // Insertion de la ligne
        tx.execute(
            "INSERT INTO achats_lignes (id, achat_id, produit_id, quantite, prix_unitaire) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![ligne_id, id, ligne.produit_id, ligne.quantite, ligne.prix_unitaire],
        )?;

        // Mise à jour du stock (on ajoute la quantité achetée)
        let updated = tx.execute(
            "UPDATE produits SET stock = stock + ?1 WHERE id = ?2",
            params![ligne.quantite, ligne.produit_id],
        )?;

        // Si le produit n'existait pas, on annule tout !
        if updated == 0 {
            return Err(AppError::Other(format!("Produit {} introuvable lors de l'achat", ligne.produit_id)));
        }
    }

    // 4. Valider la transaction (tout a réussi)
    tx.commit()?;

    Ok(AchatPayload { id, fournisseur_id: input.fournisseur_id, total, date_achat })
}