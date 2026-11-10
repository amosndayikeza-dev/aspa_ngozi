//! Logique métier des animaux (CRUD et liste par client).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimalPayload {
    pub id: String,
    pub client_id: String,
    pub nom: String,
    pub espece: String,
    pub race: Option<String>,
    pub sexe: Option<String>,
    pub date_naissance: Option<String>,
    pub poids_kg: Option<f64>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimalInput {
    pub client_id: String,
    pub nom: String,
    pub espece: String,
    pub race: Option<String>,
    pub sexe: Option<String>,
    pub date_naissance: Option<String>,
    pub poids_kg: Option<f64>,
}

/// Liste tous les animaux d'un client spécifique.
pub fn list_by_client(conn: &Connection, client_id: &str) -> Result<Vec<AnimalPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, client_id, nom, espece, race, sexe, date_naissance, poids_kg, created_at 
         FROM animaux WHERE client_id = ?1 ORDER BY nom ASC"
    )?;
    
    let rows = stmt.query_map([client_id], |row| {
        Ok(AnimalPayload {
            id: row.get(0)?, client_id: row.get(1)?, nom: row.get(2)?,
            espece: row.get(3)?, race: row.get(4)?, sexe: row.get(5)?,
            date_naissance: row.get(6)?, poids_kg: row.get(7)?, created_at: row.get(8)?,
        })
    })?;

    let mut animaux = Vec::new();
    for row in rows { animaux.push(row?); }
    Ok(animaux)
}

/// Récupère un animal par son ID.
pub fn get(conn: &Connection, id: &str) -> Result<AnimalPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, client_id, nom, espece, race, sexe, date_naissance, poids_kg, created_at 
         FROM animaux WHERE id = ?1",
        [id],
        |row| {
            Ok(AnimalPayload {
                id: row.get(0)?, client_id: row.get(1)?, nom: row.get(2)?,
                espece: row.get(3)?, race: row.get(4)?, sexe: row.get(5)?,
                date_naissance: row.get(6)?, poids_kg: row.get(7)?, created_at: row.get(8)?,
            })
        },
    );

    match result {
        Ok(a) => Ok(a),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Animal introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Crée un nouvel animal.
pub fn create(conn: &Connection, input: AnimalInput) -> Result<AnimalPayload, AppError> {
    let id = format!("A-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO animaux (id, client_id, nom, espece, race, sexe, date_naissance, poids_kg, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            id, input.client_id, input.nom, input.espece, input.race, 
            input.sexe, input.date_naissance, input.poids_kg, now
        ],
    )?;

    get(conn, &id)
}

/// Met à jour un animal existant.
pub fn update(conn: &Connection, id: &str, input: AnimalInput) -> Result<AnimalPayload, AppError> {
    let affected = conn.execute(
        "UPDATE animaux 
         SET client_id = ?1, nom = ?2, espece = ?3, race = ?4, sexe = ?5, date_naissance = ?6, poids_kg = ?7
         WHERE id = ?8",
        params![
            input.client_id, input.nom, input.espece, input.race, 
            input.sexe, input.date_naissance, input.poids_kg, id
        ],
    )?;

    if affected == 0 {
        return Err(AppError::Other("Animal introuvable pour la mise à jour".to_string()));
    }

    get(conn, id)
}

/// Supprime un animal.
pub fn delete(conn: &Connection, id: &str) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM animaux WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::Other("Animal introuvable pour la suppression".to_string()));
    }
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests unitaires (incluant le test CASCADE)
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        // ⚠️ Très important : activer les clés étrangères pour tester le CASCADE
        conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();
        conn.execute_batch(
            r#"
            CREATE TABLE clients (id TEXT PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, created_at TEXT NOT NULL);
            CREATE TABLE animaux (
                id TEXT PRIMARY KEY, client_id TEXT NOT NULL, nom TEXT NOT NULL, espece TEXT NOT NULL,
                race TEXT, sexe TEXT, date_naissance TEXT, poids_kg REAL, created_at TEXT NOT NULL,
                FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
            );
            INSERT INTO clients (id, nom, prenom, created_at) VALUES ('C-01', 'Doe', 'John', '2025');
            "#
        ).unwrap();
        conn
    }

    #[test]
    fn test_crud_animal() {
        let conn = setup_db();
        let input = AnimalInput {
            client_id: "C-01".to_string(), nom: "Rex".to_string(), espece: "Chien".to_string(),
            race: None, sexe: None, date_naissance: None, poids_kg: Some(10.0),
        };
        
        let a = create(&conn, input).unwrap();
        assert_eq!(a.nom, "Rex");

        let fetched = get(&conn, &a.id).unwrap();
        assert_eq!(fetched.espece, "Chien");

        delete(&conn, &a.id).unwrap();
        assert!(get(&conn, &a.id).is_err());
    }

    #[test]
    fn test_cascade_delete() {
        let conn = setup_db();
        // Créer un animal lié à C-01
        let input = AnimalInput {
            client_id: "C-01".to_string(), nom: "Rex".to_string(), espece: "Chien".to_string(),
            race: None, sexe: None, date_naissance: None, poids_kg: None,
        };
        create(&conn, input).unwrap();

        // Vérifier qu'il existe
        let count_before: i64 = conn.query_row("SELECT COUNT(*) FROM animaux", [], |r| r.get(0)).unwrap();
        assert_eq!(count_before, 1);

        // Supprimer le client (ce qui doit supprimer l'animal en cascade)
        conn.execute("DELETE FROM clients WHERE id = 'C-01'", []).unwrap();

        // Vérifier que l'animal a disparu
        let count_after: i64 = conn.query_row("SELECT COUNT(*) FROM animaux", [], |r| r.get(0)).unwrap();
        assert_eq!(count_after, 0);
    }
}