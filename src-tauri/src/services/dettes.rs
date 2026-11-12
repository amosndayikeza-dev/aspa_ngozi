//! Logique métier des dettes clients (créances).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DettePayload {
    pub id: String,
    pub vente_id: String,
    pub client_id: String,
    pub client_nom: String,
    pub montant_initial: f64,
    pub montant_paye: f64,
    pub montant_restant: f64,
    pub date_echeance: String,
    pub statut: String,
    pub jours_restants: i64,   // négatif si en retard
    pub created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaiementPayload {
    pub id: String,
    pub dette_id: String,
    pub montant: f64,
    pub mode_paiement: String,
    pub date_paiement: String,
    pub user_nom: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDetteInput {
    pub vente_id: String,
    pub client_id: String,
    pub montant_initial: f64,
    pub montant_paye: f64,        // 0 = rien payé, partiel = acompte
    pub mode_paiement: String,    // mode de l'acompte éventuel
    pub date_echeance: String,
    pub user_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaiementInput {
    pub dette_id: String,
    pub montant: f64,
    pub mode_paiement: String,
    pub user_id: String,
    pub notes: Option<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// CRÉATION D'UNE DETTE (appelée depuis ventes.rs)
// ─────────────────────────────────────────────────────────────────────────────

/// Crée une dette liée à une vente. Si `montant_paye > 0`, on enregistre
/// automatiquement un paiement initial (l'acompte versé à la vente).
pub fn create_from_vente(
    conn: &Connection,
    input: CreateDetteInput,
) -> Result<DettePayload, AppError> {
    let dette_id = format!("DET-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    // 1. Créer la dette
    conn.execute(
        "INSERT INTO dettes (id, vente_id, client_id, montant_initial, montant_paye, 
                             date_echeance, statut, user_id, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            dette_id, input.vente_id, input.client_id,
            input.montant_initial, input.montant_paye,
            input.date_echeance, "EN_COURS",
            input.user_id, now
        ],
    )?;

    // 2. Si un acompte a été versé, on l'enregistre dans l'historique
    if input.montant_paye > 0.0 {
        let paiement_id = format!("PAY-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        conn.execute(
            "INSERT INTO paiements_dettes (id, dette_id, montant, mode_paiement, 
                                            date_paiement, user_id, notes, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                paiement_id, dette_id, input.montant_paye,
                input.mode_paiement, now, input.user_id,
                "Acompte versé à la vente", now
            ],
        )?;
    }

    get_by_id(conn, &dette_id)
}

// ─────────────────────────────────────────────────────────────────────────────
// PAIEMENT D'UN VERSEMENT
// ─────────────────────────────────────────────────────────────────────────────

/// Enregistre un nouveau versement sur une dette existante.
pub fn enregistrer_paiement(
    conn: &Connection,
    input: PaiementInput,
) -> Result<DettePayload, AppError> {
    // 1. Vérifier la dette et calculer le reste à payer
    let (montant_initial, montant_actuel_paye): (f64, f64) = conn.query_row(
        "SELECT montant_initial, montant_paye FROM dettes WHERE id = ?1",
        [&input.dette_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|_| AppError::Other("Dette introuvable".to_string()))?;

    let reste = montant_initial - montant_actuel_paye;

    if input.montant <= 0.0 {
        return Err(AppError::Other("Le montant versé doit être supérieur à 0".to_string()));
    }

    if input.montant > reste + 0.01 {
        return Err(AppError::Other(format!(
            "Le montant versé ({}) dépasse le reste à payer ({})",
            input.montant, reste
        )));
    }

    // 2. Enregistrer le paiement
    let paiement_id = format!("PAY-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO paiements_dettes (id, dette_id, montant, mode_paiement, 
                                        date_paiement, user_id, notes, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            paiement_id, input.dette_id, input.montant,
            input.mode_paiement, now, input.user_id, input.notes, now
        ],
    )?;

    // 3. Mettre à jour le montant payé et le statut
    let nouveau_total_paye = montant_actuel_paye + input.montant;
    let nouveau_statut = if nouveau_total_paye >= montant_initial - 0.01 {
        "SOLDE"
    } else {
        "EN_COURS"
    };

    conn.execute(
        "UPDATE dettes SET montant_paye = ?1, statut = ?2 WHERE id = ?3",
        params![nouveau_total_paye, nouveau_statut, input.dette_id],
    )?;

    get_by_id(conn, &input.dette_id)
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURE
// ─────────────────────────────────────────────────────────────────────────────

/// Récupère une dette par ID avec le nom du client.
pub fn get_by_id(conn: &Connection, id: &str) -> Result<DettePayload, AppError> {
    let result = conn.query_row(
        "SELECT d.id, d.vente_id, d.client_id, c.nom || ' ' || c.prenom,
                d.montant_initial, d.montant_paye, d.date_echeance, d.statut, d.created_at
         FROM dettes d
         JOIN clients c ON c.id = d.client_id
         WHERE d.id = ?1",
        [id],
        |row| {
            let initial: f64 = row.get(4)?;
            let paye: f64 = row.get(5)?;
            let echeance: String = row.get(6)?;
            Ok((
                row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?,
                row.get::<_, String>(3)?, initial, paye, echeance,
                row.get::<_, String>(7)?, row.get::<_, String>(8)?,
            ))
        },
    );

    match result {
        Ok((id, vente_id, client_id, client_nom, initial, paye, echeance, statut, created_at)) => {
            let jours_restants = calculer_jours_restants(&echeance);
            Ok(DettePayload {
                id, vente_id, client_id, client_nom,
                montant_initial: initial, montant_paye: paye,
                montant_restant: (initial - paye).max(0.0),
                date_echeance: echeance, statut, jours_restants, created_at,
            })
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Dette introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Liste toutes les dettes (avec filtres optionnels).
pub fn list(
    conn: &Connection,
    statut_filter: Option<&str>,
    client_id_filter: Option<&str>,
) -> Result<Vec<DettePayload>, AppError> {
    let mut sql = String::from(
        "SELECT d.id, d.vente_id, d.client_id, c.nom || ' ' || c.prenom,
                d.montant_initial, d.montant_paye, d.date_echeance, d.statut, d.created_at
         FROM dettes d
         JOIN clients c ON c.id = d.client_id
         WHERE 1=1"
    );
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(s) = statut_filter {
        sql.push_str(" AND d.statut = ?");
        params_vec.push(Box::new(s.to_string()));
    }
    if let Some(cid) = client_id_filter {
        sql.push_str(" AND d.client_id = ?");
        params_vec.push(Box::new(cid.to_string()));
    }
    sql.push_str(" ORDER BY d.created_at DESC");

    let mut stmt = conn.prepare(&sql)?;
    let param_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

    let rows = stmt.query_map(param_refs.as_slice(), |row| {
        let initial: f64 = row.get(4)?;
        let paye: f64 = row.get(5)?;
        let echeance: String = row.get(6)?;
        Ok((
            row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?,
            row.get::<_, String>(3)?, initial, paye, echeance,
            row.get::<_, String>(7)?, row.get::<_, String>(8)?,
        ))
    })?;

    let mut dettes = Vec::new();
    for r in rows {
        let (id, vente_id, client_id, client_nom, initial, paye, echeance, statut, created_at) = r?;
        let jours_restants = calculer_jours_restants(&echeance);
        dettes.push(DettePayload {
            id, vente_id, client_id, client_nom,
            montant_initial: initial, montant_paye: paye,
            montant_restant: (initial - paye).max(0.0),
            date_echeance: echeance, statut, jours_restants, created_at,
        });
    }
    Ok(dettes)
}

/// Historique des paiements d'une dette.
pub fn list_paiements(conn: &Connection, dette_id: &str) -> Result<Vec<PaiementPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT p.id, p.dette_id, p.montant, p.mode_paiement, p.date_paiement, u.nom, p.notes
         FROM paiements_dettes p
         JOIN users u ON u.id = p.user_id
         WHERE p.dette_id = ?1
         ORDER BY p.created_at DESC"
    )?;
    let rows = stmt.query_map([dette_id], |row| {
        Ok(PaiementPayload {
            id: row.get(0)?, dette_id: row.get(1)?, montant: row.get(2)?,
            mode_paiement: row.get(3)?, date_paiement: row.get(4)?,
            user_nom: row.get(5)?, notes: row.get(6)?,
        })
    })?;
    let mut paiements = Vec::new();
    for r in rows { paiements.push(r?); }
    Ok(paiements)
}

/// Somme totale des créances en cours (pour le dashboard).
pub fn get_total_creances(conn: &Connection) -> Result<f64, AppError> {
    let total: f64 = conn.query_row(
        "SELECT COALESCE(SUM(montant_initial - montant_paye), 0.0) 
         FROM dettes WHERE statut = 'EN_COURS'",
        [],
        |row| row.get(0),
    )?;
    Ok(total)
}

/// Somme totale due par un client spécifique.
pub fn get_total_du_by_client(conn: &Connection, client_id: &str) -> Result<f64, AppError> {
    let total: f64 = conn.query_row(
        "SELECT COALESCE(SUM(montant_initial - montant_paye), 0.0) 
         FROM dettes WHERE client_id = ?1 AND statut = 'EN_COURS'",
        [client_id],
        |row| row.get(0),
    )?;
    Ok(total)
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/// Calcule le nombre de jours entre aujourd'hui et la date d'échéance.
/// Positif = jours restants, négatif = jours de retard.
fn calculer_jours_restants(date_echeance: &str) -> i64 {
    use chrono::NaiveDate;
    if let Ok(echeance) = NaiveDate::parse_from_str(date_echeance, "%Y-%m-%d") {
        let today = chrono::Local::now().date_naive();
        (echeance - today).num_days()
    } else {
        0
    }
}