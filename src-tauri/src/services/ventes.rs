//! Logique métier des ventes (Transactions et vérification de stock).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneVenteInput {
    pub produit_id: String,
    pub quantite: i64,
    pub prix_unitaire: f64, // Le prix au moment de la vente
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VenteInput {
    pub client_id: String,
    pub animal_id: Option<String>,
    pub user_id: String, // Le vendeur
    pub mode_paiement: String,
    pub lignes: Vec<LigneVenteInput>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VentePayload {
    pub id: String,
    pub client_id: String,
    pub animal_id: Option<String>,
    pub user_id: String,
    pub total: f64,
    pub mode_paiement: String,
    pub date_vente: String,
}

/// Crée une vente et DÉCRÉMENTE le stock des produits (Transaction).
pub fn create(conn: &mut Connection, input: VenteInput) -> Result<VentePayload, AppError> {
    let tx = conn.transaction()?;

    let id = format!("V-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    let date_vente = chrono::Local::now().format("%Y-%m-%d %H:%M").to_string();
    
    // Calcul du total
    let total: f64 = input.lignes.iter().map(|l| l.quantite as f64 * l.prix_unitaire).sum();

    // 1. Insérer la vente
    tx.execute(
        "INSERT INTO ventes (id, client_id, animal_id, user_id, total, mode_paiement, date_vente, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, input.client_id, input.animal_id, input.user_id, total, input.mode_paiement, date_vente, now],
    )?;

    // 2. Insérer les lignes et mettre à jour le stock
    for ligne in input.lignes {
        let ligne_id = format!("LV-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        let sous_total = ligne.quantite as f64 * ligne.prix_unitaire;

        // Vérifier le stock actuel AVANT de vendre
        let stock_actuel: i64 = tx.query_row(
            "SELECT stock FROM produits WHERE id = ?1",
            [&ligne.produit_id],
            |row| row.get(0),
        ).map_err(|_| AppError::Other(format!("Produit {} introuvable", ligne.produit_id)))?;

        if stock_actuel < ligne.quantite {
            // ⚠️ On déclenche une erreur. La transaction sera annulée (rollback automatique)
            return Err(AppError::Other(format!(
                "Stock insuffisant pour le produit {}. Requis: {}, Disponible: {}", 
                ligne.produit_id, ligne.quantite, stock_actuel
            )));
        }

        // Insérer la ligne de vente
        tx.execute(
            "INSERT INTO ventes_lignes (id, vente_id, produit_id, quantite, prix_unitaire, sous_total) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ligne_id, id, ligne.produit_id, ligne.quantite, ligne.prix_unitaire, sous_total],
        )?;

        // Décrémenter le stock
        tx.execute(
            "UPDATE produits SET stock = stock - ?1 WHERE id = ?2",
            params![ligne.quantite, ligne.produit_id],
        )?;
    }

    // 3. Valider la transaction
    tx.commit()?;

    Ok(VentePayload {
        id,
        client_id: input.client_id,
        animal_id: input.animal_id,
        user_id: input.user_id,
        total,
        mode_paiement: input.mode_paiement,
        date_vente,
    })
}

/// Liste l'historique des ventes récentes.
pub fn list_history(conn: &Connection) -> Result<Vec<VentePayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, client_id, animal_id, user_id, total, mode_paiement, date_vente 
         FROM ventes ORDER BY created_at DESC LIMIT 50"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(VentePayload {
            id: row.get(0)?, client_id: row.get(1)?, animal_id: row.get(2)?,
            user_id: row.get(3)?, total: row.get(4)?, mode_paiement: row.get(5)?, date_vente: row.get(6)?,
        })
    })?;

    let mut ventes = Vec::new();
    for row in rows { ventes.push(row?); }
    Ok(ventes)
}