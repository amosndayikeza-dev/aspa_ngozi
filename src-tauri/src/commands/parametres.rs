//! Commandes Tauri pour les paramètres.

use crate::error::AppError;
use crate::services::parametres::{self, ParametresInput, ParametresPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_parametres(state: State<'_, AppState>) -> Result<ParametresPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    parametres::get(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_parametres(state: State<'_, AppState>, data: ParametresInput, current_user_role: String) -> Result<ParametresPayload, String> {
    if current_user_role != "ADMIN" {
        return Err("Seul un administrateur peut modifier les paramètres".to_string());
    }
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    parametres::update(&conn, data).map_err(|e| e.to_string())
}