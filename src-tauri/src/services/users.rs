//! Logique métier de gestion des utilisateurs (Administration).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPayload {
    pub id: String,
    pub nom: String,
    pub email: String,
    pub role: String,
    pub actif: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserInput {
    pub nom: String,
    pub email: String,
    pub password: Option<String>, // Optionnel : si vide en modification, on ne change pas le mot de passe
    pub role: String,
}

/// Liste tous les utilisateurs (sans les mots de passe).
pub fn list(conn: &Connection) -> Result<Vec<UserPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nom, email, role, actif, created_at FROM users ORDER BY nom ASC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        let actif_int: i64 = row.get(4)?;
        Ok(UserPayload {
            id: row.get(0)?, nom: row.get(1)?, email: row.get(2)?,
            role: row.get(3)?, actif: actif_int == 1, created_at: row.get(5)?,
        })
    })?;

    let mut users = Vec::new();
    for row in rows { users.push(row?); }
    Ok(users)
}

/// Crée un nouvel utilisateur (mot de passe obligatoire).
pub fn create(conn: &Connection, input: UserInput) -> Result<UserPayload, AppError> {
    let password = input.password.ok_or_else(|| AppError::Other("Mot de passe requis".to_string()))?;
    let hash = bcrypt::hash(password, 10).map_err(|e| AppError::Hash(e.to_string()))?;
    
    let id = format!("U-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO users (id, nom, email, password_hash, role, actif, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6)",
        params![id, input.nom, input.email, hash, input.role, now],
    ).map_err(|e| {
        if e.to_string().contains("UNIQUE constraint failed") {
            AppError::Other("Cet email est déjà utilisé".to_string())
        } else {
            e.into()
        }
    })?;

    get(conn, &id)
}

/// Récupère un utilisateur par ID.
pub fn get(conn: &Connection, id: &str) -> Result<UserPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, nom, email, role, actif, created_at FROM users WHERE id = ?1",
        [id],
        |row| {
            let actif_int: i64 = row.get(4)?;
            Ok(UserPayload {
                id: row.get(0)?, nom: row.get(1)?, email: row.get(2)?,
                role: row.get(3)?, actif: actif_int == 1, created_at: row.get(5)?,
            })
        },
    );

    match result {
        Ok(u) => Ok(u),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Utilisateur introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Met à jour un utilisateur (le mot de passe est optionnel).
pub fn update(conn: &Connection, id: &str, input: UserInput) -> Result<UserPayload, AppError> {
    // Si un nouveau mot de passe est fourni, on le hash
    if let Some(password) = &input.password {
        if !password.trim().is_empty() {
            let hash = bcrypt::hash(password, 10).map_err(|e| AppError::Hash(e.to_string()))?;
            conn.execute("UPDATE users SET password_hash = ?1 WHERE id = ?2", params![hash, id])?;
        }
    }

    let affected = conn.execute(
        "UPDATE users SET nom = ?1, email = ?2, role = ?3 WHERE id = ?4",
        params![input.nom, input.email, input.role, id],
    ).map_err(|e| {
        if e.to_string().contains("UNIQUE constraint failed") {
            AppError::Other("Cet email est déjà utilisé".to_string())
        } else {
            e.into()
        }
    })?;

    if affected == 0 {
        return Err(AppError::Other("Utilisateur introuvable".to_string()));
    }

    get(conn, id)
}

/// Active ou désactive un compte utilisateur.
pub fn toggle_actif(conn: &Connection, id: &str, actif: bool) -> Result<(), AppError> {
    let val = if actif { 1 } else { 0 };
    let affected = conn.execute("UPDATE users SET actif = ?1 WHERE id = ?2", params![val, id])?;
    
    if affected == 0 {
        return Err(AppError::Other("Utilisateur introuvable".to_string()));
    }
    Ok(())
}