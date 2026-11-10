use crate::error::AppError;
use crate::services::ordonnances::{self, OrdonnanceInput, OrdonnancePayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn create_ordonnance(state: State<'_, AppState>, data: OrdonnanceInput) -> Result<(), String> {
    let mut conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    ordonnances::create(&mut conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_ordonnances(state: State<'_, AppState>) -> Result<Vec<OrdonnancePayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    ordonnances::list_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_ordonnance(state: State<'_, AppState>, id: String) -> Result<OrdonnancePayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    ordonnances::get_by_id(&conn, &id).map_err(|e| e.to_string())
}