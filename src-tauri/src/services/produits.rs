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
    pub prix_achat: f64,
    pub prix_vente: f64,
    pub stock: i64,
    pub seuil_alerte: i64,
    pub date_peremption: Option<String>,
    pub image_path: Option<String>, // 👈 AJOUTÉ ICI
}

pub fn list(conn: &Connection) -> Result<Vec<ProduitPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nom, dci, forme, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits ORDER BY nom ASC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(ProduitPayload {
            id: row.get(0)?,
            nom: row.get(1)?,
            dci: row.get(2)?,
            forme: row.get(3)?,
            prix_achat: row.get(4)?,
            prix_vente: row.get(5)?,
            stock: row.get(6)?,
            seuil_alerte: row.get(7)?,
            date_peremption: row.get(8)?,
            image_path: row.get(9)?,   // 👈 Index 9
            created_at: row.get(10)?,  // 👈 Index 10
        })
    })?;

    let mut produits = Vec::new();
    for row in rows { produits.push(row?); }
    Ok(produits)
}

pub fn get(conn: &Connection, id: &str) -> Result<ProduitPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, nom, dci, forme, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits WHERE id = ?1",
        [id],
        |row| {
            Ok(ProduitPayload {
                id: row.get(0)?,
                nom: row.get(1)?,
                dci: row.get(2)?,
                forme: row.get(3)?,
                prix_achat: row.get(4)?,
                prix_vente: row.get(5)?,
                stock: row.get(6)?,
                seuil_alerte: row.get(7)?,
                date_peremption: row.get(8)?,
                image_path: row.get(9)?,
                created_at: row.get(10)?,
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
        "INSERT INTO produits (id, nom, dci, forme, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)", // 👈 11 paramètres
        params![
            id, input.nom, input.dci, input.forme, 
            input.prix_achat, input.prix_vente, input.stock, 
            input.seuil_alerte, input.date_peremption, input.image_path, now
        ],
    )?;

    get(conn, &id)
}

pub fn update(conn: &Connection, id: &str, input: ProduitInput) -> Result<ProduitPayload, AppError> {
    let affected = conn.execute(
        "UPDATE produits 
         SET nom = ?1, dci = ?2, forme = ?3, prix_achat = ?4, prix_vente = ?5, 
             stock = ?6, seuil_alerte = ?7, date_peremption = ?8, image_path = ?9
         WHERE id = ?10",
        params![
            input.nom, input.dci, input.forme, 
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
        "SELECT id, nom, dci, forme, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits WHERE stock <= seuil_alerte ORDER BY stock ASC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(ProduitPayload {
            id: row.get(0)?, nom: row.get(1)?, dci: row.get(2)?, forme: row.get(3)?,
            prix_achat: row.get(4)?, prix_vente: row.get(5)?, stock: row.get(6)?,
            seuil_alerte: row.get(7)?, date_peremption: row.get(8)?,
            image_path: row.get(9)?, created_at: row.get(10)?,
        })
    })?;

    let mut produits = Vec::new();
    for row in rows { produits.push(row?); }
    Ok(produits)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            r#"
            CREATE TABLE produits (
                id TEXT PRIMARY KEY, nom TEXT NOT NULL, dci TEXT, forme TEXT,
                prix_achat REAL NOT NULL, prix_vente REAL NOT NULL, stock INTEGER NOT NULL DEFAULT 0,
                seuil_alerte INTEGER NOT NULL DEFAULT 10, date_peremption TEXT, 
                image_path TEXT, created_at TEXT NOT NULL
            );
            "#
        ).unwrap();
        conn
    }

    fn dummy_input(nom: &str, stock: i64, seuil: i64) -> ProduitInput {
        ProduitInput {
            nom: nom.to_string(), dci: None, forme: None,
            prix_achat: 100.0, prix_vente: 200.0, stock, seuil_alerte: seuil,
            date_peremption: None, image_path: None, // 👈 Ajouté
        }
    }

    #[test]
    fn test_crud_produit() {
        let conn = setup_db();
        let p = create(&conn, dummy_input("Test Med", 10, 5)).unwrap();
        assert_eq!(p.nom, "Test Med");
        let fetched = get(&conn, &p.id).unwrap();
        assert_eq!(fetched.nom, "Test Med");
        let update_data = dummy_input("Test Med Updated", 20, 5); // enlevé le mut inutile
        let updated = update(&conn, &p.id, update_data).unwrap();
        assert_eq!(updated.nom, "Test Med Updated");
        delete(&conn, &p.id).unwrap();
        assert!(get(&conn, &p.id).is_err());
    }

    #[test]
    fn test_alertes_stock() {
        let conn = setup_db();
        create(&conn, dummy_input("Normal", 50, 10)).unwrap();
        create(&conn, dummy_input("Alerte", 5, 10)).unwrap();
        create(&conn, dummy_input("Limite", 10, 10)).unwrap();
        let alertes = check_alertes_stock(&conn).unwrap();
        assert_eq!(alertes.len(), 2);
        assert_eq!(alertes[0].nom, "Alerte");
    }
}