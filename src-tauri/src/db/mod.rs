//! Couche d'accès à SQLite : ouverture + initialisation du schéma.
//!
//! Le fichier `vetpharma.db` est stocké dans le dossier de données
//! applicatif (spécifique à l'OS : `%APPDATA%` sur Windows, `~/Library`
//! sur macOS, `~/.local/share` sur Linux). C'est Tauri qui nous donne ce
//! chemin via `app.path().app_data_dir()` — d'où l'importance d'un
//! `identifier` valide dans `tauri.conf.json`.

pub mod schema;

use crate::error::AppError;
use rusqlite::Connection;
use tauri::{AppHandle, Manager};

/// Ouvre (ou crée) la base SQLite et applique le schéma + seed.
pub fn init_db(app: &AppHandle) -> Result<Connection, AppError> {
    // 1. Localise le dossier de données applicatif (créé si absent).
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::Other(format!("Dossier de données introuvable : {e}")))?;

    std::fs::create_dir_all(&data_dir)?;

    // 2. Ouvre (ou crée) le fichier SQLite.
    let db_path = data_dir.join("vetpharma.db");
    let conn = Connection::open(&db_path)?;

    // 3. Bonnes pratiques SQLite (via execute_batch car `journal_mode`
    //    retourne une ligne, ce que `pragma_update` ne gère pas).
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;",
    )?;

    // 4. Applique le schéma (idempotent) + seed si base vide.
    schema::create_tables(&conn)?;
    schema::migrate_parametres(&conn)?;
    schema::seed_default_users(&conn)?;
    schema::seed_default_produits(&conn)?; 
    schema::seed_default_clients(&conn)?;
    schema::seed_default_animaux(&conn)?;
    schema::seed_default_fournisseurs(&conn)?;
    schema::seed_default_parametres(&conn)?; 


    Ok(conn)
}