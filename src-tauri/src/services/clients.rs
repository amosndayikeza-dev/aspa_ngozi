//! Logique métier des clients (CRUD + recherche).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

/// Représentation d'un client renvoyée au frontend.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientPayload {
    pub id: String,
    pub nom: String,
    pub prenom: String,
    pub telephone: Option<String>,
    pub email: Option<String>,
    pub adresse: Option<String>,
    pub animaux_count: i64, 
    pub created_at: String,
}

/// Structure attendue du frontend pour créer ou modifier un client.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientInput {
    pub nom: String,
    pub prenom: String,
    pub telephone: Option<String>,
    pub email: Option<String>,
    pub adresse: Option<String>,
}

/// Liste tous les clients (avec le nombre d'animaux).
pub fn list(conn: &Connection) -> Result<Vec<ClientPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT c.id, c.nom, c.prenom, c.telephone, c.email, c.adresse, c.created_at,
                (SELECT COUNT(*) FROM animaux a WHERE a.client_id = c.id) as animaux_count
         FROM clients c ORDER BY c.nom ASC, c.prenom ASC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(ClientPayload {
            id: row.get(0)?,
            nom: row.get(1)?,
            prenom: row.get(2)?,
            telephone: row.get(3)?,
            email: row.get(4)?,
            adresse: row.get(5)?,
            created_at: row.get(6)?,
            animaux_count: row.get(7)?, 
        })
    })?;

    let mut clients = Vec::new();
    for row in rows { clients.push(row?); }
    Ok(clients)
}

/// Récupère un client par son ID (avec le nombre d'animaux).
pub fn get(conn: &Connection, id: &str) -> Result<ClientPayload, AppError> {
    let result = conn.query_row(
        "SELECT c.id, c.nom, c.prenom, c.telephone, c.email, c.adresse, c.created_at,
                (SELECT COUNT(*) FROM animaux a WHERE a.client_id = c.id) as animaux_count
         FROM clients c WHERE c.id = ?1",
        [id],
        |row| {
            Ok(ClientPayload {
                id: row.get(0)?,
                nom: row.get(1)?,
                prenom: row.get(2)?,
                telephone: row.get(3)?,
                email: row.get(4)?,
                adresse: row.get(5)?,
                created_at: row.get(6)?,
                animaux_count: row.get(7)?,
            })
        },
    );

    match result {
        Ok(c) => Ok(c),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Client introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Recherche des clients par nom, prénom ou téléphone (avec le nombre d'animaux).
pub fn search(conn: &Connection, query: &str) -> Result<Vec<ClientPayload>, AppError> {
    let search_term = format!("%{}%", query);
    let mut stmt = conn.prepare(
        "SELECT c.id, c.nom, c.prenom, c.telephone, c.email, c.adresse, c.created_at,
                (SELECT COUNT(*) FROM animaux a WHERE a.client_id = c.id) as animaux_count
         FROM clients c
         WHERE c.nom LIKE ?1 OR c.prenom LIKE ?1 OR c.telephone LIKE ?1
         ORDER BY c.nom ASC"
    )?;
    
    let rows = stmt.query_map([search_term], |row| {
        Ok(ClientPayload {
            id: row.get(0)?,
            nom: row.get(1)?,
            prenom: row.get(2)?,
            telephone: row.get(3)?,
            email: row.get(4)?,
            adresse: row.get(5)?,
            created_at: row.get(6)?,
            animaux_count: row.get(7)?, // ✅ Ajouté ici aussi
        })
    })?;

    let mut clients = Vec::new();
    for row in rows {
        clients.push(row?);
    }
    Ok(clients)
}

/// Crée un nouveau client.
pub fn create(conn: &Connection, input: ClientInput) -> Result<ClientPayload, AppError> {
    let id = format!("C-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO clients (id, nom, prenom, telephone, email, adresse, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![id, input.nom, input.prenom, input.telephone, input.email, input.adresse, now],
    )?;

    get(conn, &id)
}

/// Met à jour un client existant.
pub fn update(conn: &Connection, id: &str, input: ClientInput) -> Result<ClientPayload, AppError> {
    let affected = conn.execute(
        "UPDATE clients 
         SET nom = ?1, prenom = ?2, telephone = ?3, email = ?4, adresse = ?5
         WHERE id = ?6",
        params![input.nom, input.prenom, input.telephone, input.email, input.adresse, id],
    )?;

    if affected == 0 {
        return Err(AppError::Other("Client introuvable pour la mise à jour".to_string()));
    }

    get(conn, id)
}

/// Supprime un client.
pub fn delete(conn: &Connection, id: &str) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM clients WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::Other("Client introuvable pour la suppression".to_string()));
    }
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests unitaires
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            r#"
            CREATE TABLE clients (
                id TEXT PRIMARY KEY,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                telephone TEXT,
                email TEXT,
                adresse TEXT,
                created_at TEXT NOT NULL
            );
            -- ✅ On ajoute la table animaux pour que la sous-requête fonctionne
            CREATE TABLE animaux (
                id TEXT PRIMARY KEY,
                client_id TEXT NOT NULL
            );
            "# 
        ).unwrap();
        conn
    }

    fn dummy_input(nom: &str, prenom: &str) -> ClientInput {
        ClientInput {
            nom: nom.to_string(),
            prenom: prenom.to_string(),
            telephone: Some("0340000000".to_string()),
            email: None,
            adresse: None,
        }
    }

    #[test]
    fn test_crud_client() {
        let conn = setup_db();
        
        let c = create(&conn, dummy_input("Dupont", "Jean")).unwrap();
        assert_eq!(c.nom, "Dupont");
        assert_eq!(c.animaux_count, 0); // ✅ Vérification du compteur

        let fetched = get(&conn, &c.id).unwrap();
        assert_eq!(fetched.prenom, "Jean");

        let updated = update(&conn, &c.id, dummy_input("Dupont", "Jeanne")).unwrap();
        assert_eq!(updated.prenom, "Jeanne");

        delete(&conn, &c.id).unwrap();
        assert!(get(&conn, &c.id).is_err());
    }

    #[test]
    fn test_search_client_with_animals() {
        let conn = setup_db();
        let c1 = create(&conn, dummy_input("Rakoto", "Jean")).unwrap();
        create(&conn, dummy_input("Randria", "Sarah")).unwrap();

        // Ajoutons un animal à Rakoto pour vérifier le comptage
        conn.execute(
            "INSERT INTO animaux (id, client_id) VALUES ('A-01', ?1)",
            [&c1.id],
        ).unwrap();

        let results = search(&conn, "Rak").unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].nom, "Rakoto");
        assert_eq!(results[0].animaux_count, 1); // ✅ Doit compter 1 animal
    }
}