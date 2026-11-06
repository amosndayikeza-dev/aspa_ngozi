//! Commandes système : health checks indépendants du métier.
//!
//! Utiles en Phase 0 pour valider que :
//!   1. Le canal Tauri (invoke) fonctionne         → `ping`
//!   2. La DB est ouverte, seedée, interrogeable   → `db_health`

use crate::state::AppState;
use serde::Serialize;
use tauri::State;

/// Health check ultra-simple : valide que `invoke` atteint Rust.
#[tauri::command]
pub fn ping() -> String {
    "pong".to_string()
}

/// Résultat structuré du health check DB (renvoyé au frontend).
#[derive(Serialize)]
pub struct DbHealth {
    pub users_count: i64,
}

/// Vérifie que la DB répond et que le seed des 3 comptes a bien eu lieu.
#[tauri::command]
pub fn db_health(state: State<'_, AppState>) -> Result<DbHealth, String> {
    let conn = state
        .db
        .lock()
        .map_err(|_| "État applicatif indisponible (Mutex empoisonné)".to_string())?;

    let users_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))
        .map_err(|e| format!("Requête DB échouée : {e}"))?;

    Ok(DbHealth { users_count })
}