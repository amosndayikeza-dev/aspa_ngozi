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

                -- Phase 4 : Table des animaux
        CREATE TABLE IF NOT EXISTS animaux (
            id             TEXT PRIMARY KEY NOT NULL,
            client_id      TEXT NOT NULL,
            nom            TEXT NOT NULL,
            espece         TEXT NOT NULL, -- Chien, Chat, Bovin, etc.
            race           TEXT,
            sexe           TEXT,          -- M ou F
            date_naissance TEXT,
            poids_kg       REAL,
            created_at     TEXT NOT NULL,
            FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
        );

                -- Phase 5 : Fournisseurs
        CREATE TABLE IF NOT EXISTS fournisseurs (
            id            TEXT PRIMARY KEY NOT NULL,
            nom           TEXT NOT NULL,
            contact       TEXT,
            telephone     TEXT,
            email         TEXT,
            created_at    TEXT NOT NULL
        );

        -- Phase 5 : Achats (Bons de commande)
        CREATE TABLE IF NOT EXISTS achats (
            id             TEXT PRIMARY KEY NOT NULL,
            fournisseur_id TEXT NOT NULL,
            total          REAL NOT NULL,
            date_achat     TEXT NOT NULL,
            created_at     TEXT NOT NULL,
            FOREIGN KEY(fournisseur_id) REFERENCES fournisseurs(id)
        );

        -- Phase 5 : Lignes d'achat
        CREATE TABLE IF NOT EXISTS achats_lignes (
            id            TEXT PRIMARY KEY NOT NULL,
            achat_id      TEXT NOT NULL,
            produit_id    TEXT NOT NULL,
            quantite      INTEGER NOT NULL,
            prix_unitaire REAL NOT NULL,
            FOREIGN KEY(achat_id) REFERENCES achats(id) ON DELETE CASCADE,
            FOREIGN KEY(produit_id) REFERENCES produits(id)
        );

        CREATE INDEX IF NOT EXISTS idx_animaux_client ON animaux(client_id);

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

/// Insère des animaux de démonstration pour les clients existants.
pub fn seed_default_animaux(conn: &Connection) -> Result<(), AppError> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM animaux", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    let now = chrono::Utc::now().to_rfc3339();
    
    // (id, client_id, nom, espece, race, sexe, date_naissance, poids)
    let defaults: [(&str, &str, &str, &str, &str, &str, &str, f64); 3] = [
        ("A-01", "C-01", "Rex", "Chien", "Berger Allemand", "M", "2020-05-12", 28.5),
        ("A-02", "C-01", "Minou", "Chat", "Européen", "F", "2022-08-20", 4.2),
        ("A-03", "C-02", "Bella", "Chien", "Golden Retriever", "F", "2019-11-03", 31.0),
    ];

    for (id, client_id, nom, espece, race, sexe, ddn, poids) in defaults {
        conn.execute(
            "INSERT INTO animaux (id, client_id, nom, espece, race, sexe, date_naissance, poids_kg, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![id, client_id, nom, espece, race, sexe, ddn, poids, now],
        )?;
    }
    Ok(())
}

/// Insère 2 fournisseurs de démonstration si la table est vide.
pub fn seed_default_fournisseurs(conn: &Connection) -> Result<(), AppError> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM fournisseurs", [], |row| row.get(0))?;
    if count > 0 { return Ok(()); }

    let now = chrono::Utc::now().to_rfc3339();
    
    let defaults: [(&str, &str, &str, &str, &str); 2] = [
        ("F-01", "Centravet", "M. Rabe", "034 00 000 01", "contact@centravet.mg"),
        ("F-02", "PharmaVet", "Mme Rasoa", "033 00 000 02", "contact@pharmavet.mg"),
    ];

    for (id, nom, contact, tel, email) in defaults {
        conn.execute(
            "INSERT INTO fournisseurs (id, nom, contact, telephone, email, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, nom, contact, tel, email, now],
        )?;
    }
    Ok(())
}