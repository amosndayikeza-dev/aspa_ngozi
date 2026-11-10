//! Logique métier des fournisseurs.

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FournisseurPayload {
    pub id: String,
    pub nom: String,
    pub contact: Option<String>,
    pub telephone: Option<String>,
    pub email: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FournisseurInput {
    pub nom: String,
    pub contact: Option<String>,
    pub telephone: Option<String>,
    pub email: Option<String>,
}

pub fn list(conn: &Connection) -> Result<Vec<FournisseurPayload>, AppError> {
    let mut stmt = conn.prepare("SELECT id, nom, contact, telephone, email, created_at FROM fournisseurs ORDER BY nom ASC")?;
    let rows = stmt.query_map([], |row| {
        Ok(FournisseurPayload {
            id: row.get(0)?, nom: row.get(1)?, contact: row.get(2)?,
            telephone: row.get(3)?, email: row.get(4)?, created_at: row.get(5)?,
        })
    })?;
    let mut res = Vec::new();
    for r in rows { res.push(r?); }
    Ok(res)
}

pub fn create(conn: &Connection, input: FournisseurInput) -> Result<FournisseurPayload, AppError> {
    let id = format!("F-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO fournisseurs (id, nom, contact, telephone, email, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, input.nom, input.contact, input.telephone, input.email, now],
    )?;
    
    let res = conn.query_row(
        "SELECT id, nom, contact, telephone, email, created_at FROM fournisseurs WHERE id = ?1",
        [&id],
        |row| Ok(FournisseurPayload {
            id: row.get(0)?, nom: row.get(1)?, contact: row.get(2)?,
            telephone: row.get(3)?, email: row.get(4)?, created_at: row.get(5)?,
        }),
    )?;
    Ok(res)
}

/// Récupère un fournisseur par son ID.
pub fn get(conn: &Connection, id: &str) -> Result<FournisseurPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, nom, contact, telephone, email, created_at FROM fournisseurs WHERE id = ?1",
        [id],
        |row| Ok(FournisseurPayload {
            id: row.get(0)?, nom: row.get(1)?, contact: row.get(2)?,
            telephone: row.get(3)?, email: row.get(4)?, created_at: row.get(5)?,
        }),
    );
    match result {
        Ok(f) => Ok(f),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Fournisseur introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Met à jour un fournisseur.
pub fn update(conn: &Connection, id: &str, input: FournisseurInput) -> Result<FournisseurPayload, AppError> {
    let affected = conn.execute(
        "UPDATE fournisseurs SET nom = ?1, contact = ?2, telephone = ?3, email = ?4 WHERE id = ?5",
        params![input.nom, input.contact, input.telephone, input.email, id],
    )?;
    if affected == 0 {
        return Err(AppError::Other("Fournisseur introuvable pour la mise à jour".to_string()));
    }
    get(conn, id)
}

/// Supprime un fournisseur.
pub fn delete(conn: &Connection, id: &str) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM fournisseurs WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::Other("Fournisseur introuvable pour la suppression".to_string()));
    }
    Ok(())
}