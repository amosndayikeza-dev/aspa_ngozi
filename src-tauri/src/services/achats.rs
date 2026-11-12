//! Logique métier des achats (Réapprovisionnement du stock).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneAchatInput {
    pub produit_id: String,
    pub numero_lot: String,
    pub quantite: i64,
    pub prix_unitaire: f64,
    pub date_peremption: String,
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

pub fn create(conn: &mut Connection, input: AchatInput) -> Result<AchatPayload, AppError> {
    let tx = conn.transaction()?;

    let id = format!("ACH-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    let date_achat = chrono::Local::now().format("%Y-%m-%d").to_string();
    let total: f64 = input.lignes.iter().map(|l| l.quantite as f64 * l.prix_unitaire).sum();

    // 1. Insérer l'achat
    tx.execute(
        "INSERT INTO achats (id, fournisseur_id, total, date_achat, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![id, input.fournisseur_id, total, date_achat, now],
    )?;

    // 2. Pour chaque ligne : créer un LOT, PUIS la ligne d'achat
    for ligne in &input.lignes {
        // 2a. Vérifier que le produit existe
        let produit_existe: i64 = tx.query_row(
            "SELECT COUNT(*) FROM produits WHERE id = ?1",
            [&ligne.produit_id],
            |row| row.get(0),
        )?;
        if produit_existe == 0 {
            return Err(AppError::Other(format!("Produit {} introuvable", ligne.produit_id)));
        }

        let ligne_id = format!("L-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        let lot_id = format!("LOT-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());

        // 2b. Insérer le LOT en premier
        tx.execute(
            "INSERT INTO lots (id, produit_id, numero_lot, quantite, date_peremption, prix_achat, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                lot_id, ligne.produit_id, ligne.numero_lot,
                ligne.quantite, ligne.date_peremption, ligne.prix_unitaire, now
            ],
        )?;

        // 2c. Puis insérer la ligne d'achat (le lot existe maintenant)
        tx.execute(
            "INSERT INTO achats_lignes (id, achat_id, produit_id, lot_id, quantite, prix_unitaire) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ligne_id, id, ligne.produit_id, lot_id, ligne.quantite, ligne.prix_unitaire],
        )?;

        // 2d. Recalculer le stock
        let nouveau_stock: i64 = tx.query_row(
            "SELECT COALESCE(SUM(quantite), 0) FROM lots WHERE produit_id = ?1",
            [&ligne.produit_id],
            |row| row.get(0),
        )?;
        tx.execute(
            "UPDATE produits SET stock = ?1 WHERE id = ?2",
            params![nouveau_stock, ligne.produit_id],
        )?;
    }

    tx.commit()?;

    Ok(AchatPayload { id, fournisseur_id: input.fournisseur_id, total, date_achat })
}