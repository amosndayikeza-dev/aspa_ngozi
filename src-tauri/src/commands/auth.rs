//! Commandes Tauri d'authentification — la frontière Rust ↔ React.
//!
//! ⚠️ Convention d'erreur : chaque commande renvoie `Result<T, String>`.
//!    Le `String` est ce que React récupère dans le `catch` de `invoke`.
//!    Combiné au patch de `callBackend` (côté frontend), l'utilisateur voit
//!    toujours un `Error` avec un `.message` lisible.

use crate::error::AppError;
use crate::services::auth::{authenticate, UserPayload};
use crate::state::AppState;
use tauri::State;

/// Commande `login` — appelée par `callBackend<User>('login', { email, password })`.
#[tauri::command]
pub fn login(
    state: State<'_, AppState>,
    email: String,
    password: String,
) -> Result<UserPayload, String> {
    // Verrou court : on ne bloque le Mutex que le temps de la requête SQL.
    let conn = state
        .db
        .lock()
        .map_err(|_| AppError::StateUnavailable.to_string())?;

    authenticate(&conn, &email, &password).map_err(|e| e.to_string())
}

/// Commande `logout` — appelée par `callBackend<void>('logout')`.
#[tauri::command]
pub fn logout() -> Result<(), String> {
    Ok(())
}