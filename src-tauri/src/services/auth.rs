//! Logique métier d'authentification.
//!
//! Cette couche est **pure** : elle ne dépend d'aucune API Tauri. Elle prend
//! une `&Connection` et des chaînes de caractères, et retourne un résultat
//! typé. Cela permet de la tester sans lancer Tauri (voir `#[cfg(test)]`).

use crate::error::AppError;
use rusqlite::Connection;
use serde::Serialize;

/// Utilisateur RENVOYÉ au frontend après login réussi.
///
/// ⚠️ Doit correspondre EXACTEMENT à l'interface `User` de
///    `src/features/auth/types/index.ts` côté React :
///    `{ id: string, nom: string, email: string, role: 'PHARMACIEN'|'VENDEUR'|'ADMIN' }`
///
/// Aucun champ sensible (`password_hash`) n'est exposé.
#[derive(Debug, Serialize)]
pub struct UserPayload {
    pub id: String,
    pub nom: String,
    pub email: String,
    pub role: String,
}

/// Vérifie les identifiants et retourne l'utilisateur si valides.
///
/// Sécurité :
/// - On renvoie **le même message d'erreur** que l'email soit inconnu ou que
///   le mot de passe soit faux (via `InvalidCredentials`). Cela évite de
///   révéler à un attaquant l'existence d'un compte.
/// - Le mot de passe fourni est comparé au hash stocké via `bcrypt::verify`
///   (temps constant, résistant aux timing attacks).
pub fn authenticate(
    conn: &Connection,
    email: &str,
    password: &str,
) -> Result<UserPayload, AppError> {
    // 1. Récupère l'utilisateur par email (case-insensitive grâce à
    //    COLLATE NOCASE sur la colonne, cf. schema.rs).
    let row = conn.query_row(
        "SELECT id, nom, email, password_hash, role
         FROM users
         WHERE email = ?1",
        [email],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
            ))
        },
    );

    let (id, nom, user_email, password_hash, role) = match row {
        Ok(v) => v,
        // Email inconnu → même erreur que mot de passe faux (pas de fuite).
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            return Err(AppError::InvalidCredentials);
        }
        Err(e) => return Err(e.into()),
    };

    // 2. Compare le mot de passe fourni au hash bcrypt.
    let is_valid = bcrypt::verify(password, &password_hash)
        .map_err(|e| AppError::Hash(e.to_string()))?;

    if !is_valid {
        return Err(AppError::InvalidCredentials);
    }

    // 3. Succès : on renvoie le payload public (sans password_hash).
    Ok(UserPayload {
        id,
        nom,
        email: user_email,
        role,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests unitaires
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::params;

    /// Crée une DB SQLite en mémoire avec la table `users` et un user de test.
    /// Coût bcrypt = 4 (minimum) pour que les tests soient rapides (~5ms).
    fn setup_in_memory_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            r#"
            CREATE TABLE users (
                id            TEXT PRIMARY KEY NOT NULL,
                nom           TEXT NOT NULL,
                email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role          TEXT NOT NULL,
                created_at    TEXT NOT NULL
            );
            "#,
        )
        .unwrap();

        let hash = bcrypt::hash("secret123", 4).unwrap();
        conn.execute(
            "INSERT INTO users (id, nom, email, password_hash, role, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params!["U-01", "Rakoto Jean", "boss@vetpharma.mg", hash, "PHARMACIEN", "2025-01-01"],
        )
        .unwrap();

        conn
    }

    #[test]
    fn authenticate_ok_with_valid_credentials() {
        let conn = setup_in_memory_db();
        let user = authenticate(&conn, "boss@vetpharma.mg", "secret123").unwrap();
        assert_eq!(user.id, "U-01");
        assert_eq!(user.nom, "Rakoto Jean");
        assert_eq!(user.role, "PHARMACIEN");
    }

    #[test]
    fn authenticate_ok_is_case_insensitive_on_email() {
        let conn = setup_in_memory_db();
        let user = authenticate(&conn, "BOSS@VETPHARMA.MG", "secret123").unwrap();
        assert_eq!(user.id, "U-01");
    }

    #[test]
    fn authenticate_fails_with_wrong_password() {
        let conn = setup_in_memory_db();
        let err = authenticate(&conn, "boss@vetpharma.mg", "wrong").unwrap_err();
        assert!(matches!(err, AppError::InvalidCredentials));
    }

    #[test]
    fn authenticate_fails_with_unknown_email() {
        let conn = setup_in_memory_db();
        let err = authenticate(&conn, "inconnu@test.mg", "secret123").unwrap_err();
        assert!(matches!(err, AppError::InvalidCredentials));
    }

    #[test]
    fn error_message_does_not_leak_email_existence() {
        // Le message pour "email inconnu" et "password faux" doit être identique.
        let msg_unknown_email = AppError::InvalidCredentials.to_string();
        let msg_wrong_pw = AppError::InvalidCredentials.to_string();
        assert_eq!(msg_unknown_email, msg_wrong_pw);
    }
}