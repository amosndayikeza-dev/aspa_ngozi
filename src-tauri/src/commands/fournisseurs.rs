use crate::error::AppError;
use crate::services::fournisseurs::{self, FournisseurInput, FournisseurPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn list_fournisseurs(state: State<'_, AppState>) -> Result<Vec<FournisseurPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    fournisseurs::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_fournisseur(state: State<'_, AppState>, data: FournisseurInput) -> Result<FournisseurPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    fournisseurs::create(&conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_fournisseur(state: State<'_, AppState>, id: String, data: FournisseurInput) -> Result<FournisseurPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    fournisseurs::update(&conn, &id, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_fournisseur(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    fournisseurs::delete(&conn, &id).map_err(|e| e.to_string())
}