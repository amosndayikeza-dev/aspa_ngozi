//! Logique métier des produits (CRUD et alertes).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProduitPayload {
    pub id: String,
    pub nom: String,
    pub dci: Option<String>,
    pub forme: Option<String>,
    pub categorie: Option<String>, // 👈 NOUVEAU
    pub prix_achat: f64,
    pub prix_vente: f64,
    pub stock: i64,
    pub seuil_alerte: i64,
    pub date_peremption: Option<String>,
    pub image_path: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProduitInput {
    pub nom: String,
    pub dci: Option<String>,
    pub forme: Option<String>,
    pub categorie: Option<String>, // 👈 NOUVEAU
    pub prix_achat: f64,
    pub prix_vente: f64,
    pub stock: i64,
    pub seuil_alerte: i64,
    pub date_peremption: Option<String>,
    pub image_path: Option<String>,
}

pub fn list(conn: &Connection) -> Result<Vec<ProduitPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nom, dci, forme, categorie, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits ORDER BY nom ASC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(ProduitPayload {
            id: row.get(0)?,
            nom: row.get(1)?,
            dci: row.get(2)?,
            forme: row.get(3)?,
            categorie: row.get(4)?, // 👈 Index 4
            prix_achat: row.get(5)?,
            prix_vente: row.get(6)?,
            stock: row.get(7)?,
            seuil_alerte: row.get(8)?,
            date_peremption: row.get(9)?,
            image_path: row.get(10)?, 
            created_at: row.get(11)?,  
        })
    })?;

    let mut produits = Vec::new();
    for row in rows { produits.push(row?); }
    Ok(produits)
}

pub fn get(conn: &Connection, id: &str) -> Result<ProduitPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, nom, dci, forme, categorie, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits WHERE id = ?1",
        [id],
        |row| {
            Ok(ProduitPayload {
                id: row.get(0)?, nom: row.get(1)?, dci: row.get(2)?, forme: row.get(3)?,
                categorie: row.get(4)?, prix_achat: row.get(5)?, prix_vente: row.get(6)?,
                stock: row.get(7)?, seuil_alerte: row.get(8)?, date_peremption: row.get(9)?,
                image_path: row.get(10)?, created_at: row.get(11)?,
            })
        },
    );

    match result {
        Ok(p) => Ok(p),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Produit introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

pub fn create(conn: &Connection, input: ProduitInput) -> Result<ProduitPayload, AppError> {
    let id = format!("P-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO produits (id, nom, dci, forme, categorie, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            id, input.nom, input.dci, input.forme, input.categorie,
            input.prix_achat, input.prix_vente, input.stock, 
            input.seuil_alerte, input.date_peremption, input.image_path, now
        ],
    )?;

    get(conn, &id)
}

pub fn update(conn: &Connection, id: &str, input: ProduitInput) -> Result<ProduitPayload, AppError> {
    let affected = conn.execute(
        "UPDATE produits 
         SET nom = ?1, dci = ?2, forme = ?3, categorie = ?4, prix_achat = ?5, prix_vente = ?6, 
             stock = ?7, seuil_alerte = ?8, date_peremption = ?9, image_path = ?10
         WHERE id = ?11",
        params![
            input.nom, input.dci, input.forme, input.categorie,
            input.prix_achat, input.prix_vente, input.stock, 
            input.seuil_alerte, input.date_peremption, input.image_path, id
        ],
    )?;

    if affected == 0 {
        return Err(AppError::Other("Produit introuvable pour la mise à jour".to_string()));
    }

    get(conn, id)
}

pub fn delete(conn: &Connection, id: &str) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM produits WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::Other("Produit introuvable pour la suppression".to_string()));
    }
    Ok(())
}

pub fn check_alertes_stock(conn: &Connection) -> Result<Vec<ProduitPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nom, dci, forme, categorie, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits WHERE stock <= seuil_alerte ORDER BY stock ASC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(ProduitPayload {
            id: row.get(0)?, nom: row.get(1)?, dci: row.get(2)?, forme: row.get(3)?,
            categorie: row.get(4)?, prix_achat: row.get(5)?, prix_vente: row.get(6)?,
            stock: row.get(7)?, seuil_alerte: row.get(8)?, date_peremption: row.get(9)?,
            image_path: row.get(10)?, created_at: row.get(11)?,
        })
    })?;

    let mut produits = Vec::new();
    for row in rows { produits.push(row?); }
    Ok(produits)
}