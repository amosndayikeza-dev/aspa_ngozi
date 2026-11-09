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

        -- Phase 2 : Table des produits
        CREATE TABLE IF NOT EXISTS produits (
            id              TEXT PRIMARY KEY NOT NULL,
            nom             TEXT NOT NULL,
            dci             TEXT,
            forme           TEXT,
            prix_achat      REAL NOT NULL,
            prix_vente      REAL NOT NULL,
            stock           INTEGER NOT NULL DEFAULT 0,
            seuil_alerte    INTEGER NOT NULL DEFAULT 10,
            date_peremption TEXT,
            image_path      TEXT,
            created_at      TEXT NOT NULL
        );

                -- Phase 3 : Table des clients
        CREATE TABLE IF NOT EXISTS clients (
            id            TEXT PRIMARY KEY NOT NULL,
            nom           TEXT NOT NULL,
            prenom        TEXT NOT NULL,
            telephone     TEXT,
            email         TEXT,
            adresse       TEXT,
            created_at    TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);

        CREATE INDEX IF NOT EXISTS idx_produits_nom ON produits(nom);
        "#,
    )?;
    Ok(())
}

/// Insère les 3 comptes de démonstration si la table est vide.
pub fn seed_default_users(conn: &Connection) -> Result<(), AppError> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    let defaults: [(&str, &str, &str, &str, &str); 3] = [
        ("1", "Rakoto Jean",   "boss@vetpharma.mg",    "123456", "PHARMACIEN"),
        ("2", "Randria Sarah", "vendeur@vetpharma.mg", "123456", "VENDEUR"),
        ("3", "Admin Système", "admin@vetpharma.mg",   "123456", "ADMIN"),
    ];

    let now = chrono::Utc::now().to_rfc3339();

    for (id, nom, email, plain_password, role) in defaults {
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

/// Insère 5 produits de démonstration si la table est vide.
/// 2 produits ont un stock bas pour tester les alertes.
pub fn seed_default_produits(conn: &Connection) -> Result<(), AppError> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM produits", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    let now = chrono::Utc::now().to_rfc3339();
    
    // (id, nom, dci, forme, prix_achat, prix_vente, stock, seuil, peremption)
    let defaults: [(&str, &str, &str, &str, f64, f64, i64, i64, &str); 5] = [
        ("P-01", "Amoxicilline 500mg", "Amoxicilline", "Comprimé", 1500.0, 2500.0, 200, 20, "2027-12-31"),
        ("P-02", "Ivermectine Injectable", "Ivermectine", "Injectable", 3000.0, 5000.0, 5, 10, "2026-06-30"), // ⚠️ Alerte
        ("P-03", "Vermifuge Chien", "Praziquantel", "Comprimé", 2000.0, 3500.0, 50, 15, "2028-01-15"),
        ("P-04", "Antibiotique Chat", "Doxycycline", "Sirop", 4500.0, 7000.0, 3, 10, "2026-09-20"), // ⚠️ Alerte
        ("P-05", "Vitamines B Complexe", "Vitamine B", "Injectable", 1000.0, 1800.0, 100, 20, "2027-03-10"),
    ];

    for (id, nom, dci, forme, p_achat, p_vente, stock, seuil, peremption) in defaults {
        conn.execute(
            "INSERT INTO produits (id, nom, dci, forme, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![id, nom, dci, forme, p_achat, p_vente, stock, seuil, peremption, now],
        )?;
    }
    Ok(())
}

/// Insère 3 clients de démonstration si la table est vide.
pub fn seed_default_clients(conn: &Connection) -> Result<(), AppError> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM clients", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    let now = chrono::Utc::now().to_rfc3339();
    
    // (id, nom, prenom, telephone, email, adresse)
    let defaults: [(&str, &str, &str, &str, &str, &str); 3] = [
        ("C-01", "Rakoto", "Jean", "034 12 345 67", "jean.rakoto@email.mg", "Lot II B 12, Antananarivo"),
        ("C-02", "Randria", "Sarah", "033 45 678 90", "sarah.randria@email.mg", "Villa Rose, Toamasina"),
        ("C-03", "Rabe", "Paul", "032 11 223 34", "paul.rabe@email.mg", "Ambatolampy"),
    ];

    for (id, nom, prenom, tel, email, adresse) in defaults {
        conn.execute(
            "INSERT INTO clients (id, nom, prenom, telephone, email, adresse, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![id, nom, prenom, tel, email, adresse, now],
        )?;
    }
    Ok(())
}