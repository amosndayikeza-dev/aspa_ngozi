//! Logique métier des lots de produits.
//!
//! Un "lot" est un ensemble d'unités d'un produit qui partagent la même
//! date de péremption et le même prix d'achat. C'est le niveau de granularité
//! requis pour une pharmacie (traçabilité, FEFO, rappels fournisseur).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LotPayload {
    pub id: String,
    pub produit_id: String,
    pub numero_lot: String,
    pub quantite: i64,
    pub date_peremption: String,
    pub prix_achat: f64,
    pub jours_restants: i64,
    pub statut: String, // 'PERIME' | 'EXPIRE_BIENTOT' | 'VALIDE'
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LotInput {
    pub produit_id: String,
    pub numero_lot: String,
    pub quantite: i64,
    pub date_peremption: String,
    pub prix_achat: f64,
}

/// Liste tous les lots d'un produit.
pub fn list_by_produit(conn: &Connection, produit_id: &str) -> Result<Vec<LotPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, produit_id, numero_lot, quantite, date_peremption, prix_achat, created_at
         FROM lots WHERE produit_id = ?1
         ORDER BY date_peremption ASC"
    )?;

    let rows = stmt.query_map([produit_id], |row| {
        let date_peremption: String = row.get(4)?;
        let jours = calculer_jours_restants(&date_peremption);
        let quantite: i64 = row.get(3)?;

        Ok(LotPayload {
            id: row.get(0)?,
            produit_id: row.get(1)?,
            numero_lot: row.get(2)?,
            quantite,
            date_peremption: date_peremption.clone(),
            prix_achat: row.get(5)?,
            jours_restants: jours,
            statut: calculer_statut(jours, quantite),
            created_at: row.get(6)?,
        })
    })?;

    let mut lots = Vec::new();
    for r in rows {
        lots.push(r?);
    }
    Ok(lots)
}

/// Crée un nouveau lot.
pub fn create(conn: &Connection, input: LotInput) -> Result<LotPayload, AppError> {
    let id = format!("LOT-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO lots (id, produit_id, numero_lot, quantite, date_peremption, prix_achat, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            id, input.produit_id, input.numero_lot, input.quantite,
            input.date_peremption, input.prix_achat, now
        ],
    )?;

    get_by_id(conn, &id)
}

/// Récupère un lot par son ID.
pub fn get_by_id(conn: &Connection, id: &str) -> Result<LotPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, produit_id, numero_lot, quantite, date_peremption, prix_achat, created_at
         FROM lots WHERE id = ?1",
        [id],
        |row| {
            let date_peremption: String = row.get(4)?;
            let jours = calculer_jours_restants(&date_peremption);
            let quantite: i64 = row.get(3)?;
            Ok(LotPayload {
                id: row.get(0)?,
                produit_id: row.get(1)?,
                numero_lot: row.get(2)?,
                quantite,
                date_peremption: date_peremption.clone(),
                prix_achat: row.get(5)?,
                jours_restants: jours,
                statut: calculer_statut(jours, quantite),
                created_at: row.get(6)?,
            })
        },
    );

    match result {
        Ok(l) => Ok(l),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Lot introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Met à jour un lot existant.
pub fn update(conn: &Connection, id: &str, input: LotInput) -> Result<LotPayload, AppError> {
    let affected = conn.execute(
        "UPDATE lots 
         SET numero_lot = ?1, quantite = ?2, date_peremption = ?3, prix_achat = ?4
         WHERE id = ?5",
        params![
            input.numero_lot, input.quantite, input.date_peremption,
            input.prix_achat, id
        ],
    )?;

    if affected == 0 {
        return Err(AppError::Other("Lot introuvable".to_string()));
    }

    get_by_id(conn, id)
}

/// Supprime un lot.
pub fn delete(conn: &Connection, id: &str) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM lots WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::Other("Lot introuvable".to_string()));
    }
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/// Calcule le nombre de jours entre aujourd'hui et la date d'échéance.
/// Positif = jours restants, négatif = jours de retard.
pub fn calculer_jours_restants(date_peremption: &str) -> i64 {
    use chrono::NaiveDate;
    if let Ok(date) = NaiveDate::parse_from_str(date_peremption, "%Y-%m-%d") {
        let today = chrono::Local::now().date_naive();
        (date - today).num_days()
    } else {
        0
    }
}

/// Détermine le statut d'un lot.
pub fn calculer_statut(jours_restants: i64, quantite: i64) -> String {
    if quantite <= 0 {
        "VIDE".to_string()
    } else if jours_restants < 0 {
        "PERIME".to_string()
    } else if jours_restants <= 30 {
        "EXPIRE_BIENTOT".to_string()
    } else {
        "VALIDE".to_string()
    }
}