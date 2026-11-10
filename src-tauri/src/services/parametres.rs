use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParametresPayload {
    #[serde(rename = "nom")]
    pub nom_pharmacie: String,
    pub adresse: Option<String>,
    pub telephone: Option<String>,
    pub email: Option<String>,
    pub devise: String,
    pub tva: f64,
    #[serde(rename = "logoUrl")]
    pub logo_url: Option<String>,
    #[serde(rename = "messageTicket")]
    pub pied_ticket: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParametresInput {
    #[serde(rename = "nom")]
    pub nom_pharmacie: String,
    pub adresse: Option<String>,
    pub telephone: Option<String>,
    pub email: Option<String>,
    pub devise: String,
    pub tva: f64,
    #[serde(rename = "logoUrl")]
    pub logo_url: Option<String>,
    #[serde(rename = "messageTicket")]
    pub pied_ticket: Option<String>,
}

pub fn get(conn: &Connection) -> Result<ParametresPayload, AppError> {
    let result = conn.query_row(
        "SELECT nom_pharmacie, adresse, telephone, email, devise, tva, logo_url, pied_ticket 
         FROM parametres WHERE id = 1",
        [],
        |row| {
            Ok(ParametresPayload {
                nom_pharmacie: row.get(0)?, adresse: row.get(1)?, telephone: row.get(2)?,
                email: row.get(3)?, devise: row.get(4)?, tva: row.get(5)?,
                logo_url: row.get(6)?, pied_ticket: row.get(7)?,
            })
        },
    );

    match result {
        Ok(p) => Ok(p),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Paramètres introuvables".to_string())),
        Err(e) => Err(e.into()),
    }
}

pub fn update(conn: &Connection, input: ParametresInput) -> Result<ParametresPayload, AppError> {
    let now = chrono::Utc::now().to_rfc3339();
    
    let affected = conn.execute(
        "UPDATE parametres 
         SET nom_pharmacie = ?1, adresse = ?2, telephone = ?3, email = ?4, 
             devise = ?5, tva = ?6, logo_url = ?7, pied_ticket = ?8, updated_at = ?9
         WHERE id = 1",
        params![
            input.nom_pharmacie, input.adresse, input.telephone, input.email,
            input.devise, input.tva, input.logo_url, input.pied_ticket, now
        ],
    )?;

    if affected == 0 {
        return Err(AppError::Other("Impossible de mettre à jour".to_string()));
    }
    get(conn)
}