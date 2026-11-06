//! Schéma SQLite : création des tables + seed initial.
//!
//! Exécuté une seule fois au démarrage via `init_db`.
//! Toutes les instructions utilisent `IF NOT EXISTS` → idempotent, safe à
//! relancer à chaque démarrage sans risque de corruption.

use crate::error::AppError;
use rusqlite::{params, Connection};

/// Crée les tables si elles n'existent pas encore.
pub fn create_tables(conn: &Connection) -> Result<(), AppError> {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id            TEXT PRIMARY KEY NOT NULL,
            nom           TEXT NOT NULL,
            email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            role          TEXT NOT NULL CHECK (role IN ('PHARMACIEN', 'VENDEUR', 'ADMIN')),
            created_at    TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        "#,
    )?;
    Ok(())
}

/// Insère les 3 comptes de démonstration si la table est vide.
///
/// ⚠️ Les identifiants correspondent EXACTEMENT au mock frontend
///    (`src/shared/lib/tauri.ts`) pour une bascule transparente en Phase 1 :
///      - boss@vetpharma.mg    / 123456  (PHARMACIEN, id "1")
///      - vendeur@vetpharma.mg / 123456  (VENDEUR,    id "2")
///      - admin@vetpharma.mg   / 123456  (ADMIN,      id "3")
pub fn seed_default_users(conn: &Connection) -> Result<(), AppError> {
    // Ne seed que si la table est vide (idempotent).
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    // (id, nom, email, mot de passe en clair [seed uniquement], rôle)
    let defaults: [(&str, &str, &str, &str, &str); 3] = [
        ("1", "Rakoto Jean",   "boss@vetpharma.mg",    "123456", "PHARMACIEN"),
        ("2", "Randria Sarah", "vendeur@vetpharma.mg", "123456", "VENDEUR"),
        ("3", "Admin Système", "admin@vetpharma.mg",   "123456", "ADMIN"),
    ];

    let now = chrono::Utc::now().to_rfc3339();

    for (id, nom, email, plain_password, role) in defaults {
        // Coût bcrypt = 10 : bon compromis sécurité / perf sur desktop.
        // Le hash est unique par compte (sel aléatoire inclus par bcrypt).
        let hash = bcrypt::hash(plain_password, 10)
            .map_err(|e| AppError::Hash(e.to_string()))?;

        conn.execute(
            "INSERT INTO users (id, nom, email, password_hash, role, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, nom, email, hash, role, now],
        )?;
    }

    Ok(())
}