//! Commandes Tauri pour la gestion des animaux.

use crate::error::AppError;
use crate::services::animaux::{self, AnimalInput, AnimalPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn list_animaux_by_client(state: State<'_, AppState>, client_id: String) -> Result<Vec<AnimalPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    animaux::list_by_client(&conn, &client_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_animal(state: State<'_, AppState>, id: String) -> Result<AnimalPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    animaux::get(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_animal(state: State<'_, AppState>, data: AnimalInput) -> Result<AnimalPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    animaux::create(&conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_animal(state: State<'_, AppState>, id: String, data: AnimalInput) -> Result<AnimalPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    animaux::update(&conn, &id, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_animal(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    animaux::delete(&conn, &id).map_err(|e| e.to_string())
}