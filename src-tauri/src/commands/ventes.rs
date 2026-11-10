//! Commandes Tauri pour la gestion des ventes.

use crate::error::AppError;
use crate::services::ventes::{self, VenteInput, VentePayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn create_vente(state: State<'_, AppState>, data: VenteInput) -> Result<VentePayload, String> {
    let mut conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    ventes::create(&mut conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_ventes(state: State<'_, AppState>) -> Result<Vec<VentePayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    ventes::list_history(&conn).map_err(|e| e.to_string())
}