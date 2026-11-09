//! Commandes Tauri pour la gestion des clients.

use crate::error::AppError;
use crate::services::clients::{self, ClientInput, ClientPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn list_clients(state: State<'_, AppState>) -> Result<Vec<ClientPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    clients::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_client(state: State<'_, AppState>, id: String) -> Result<ClientPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    clients::get(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_clients(state: State<'_, AppState>, query: String) -> Result<Vec<ClientPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    clients::search(&conn, &query).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_client(state: State<'_, AppState>, data: ClientInput) -> Result<ClientPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    clients::create(&conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_client(state: State<'_, AppState>, id: String, data: ClientInput) -> Result<ClientPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    clients::update(&conn, &id, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_client(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    clients::delete(&conn, &id).map_err(|e| e.to_string())
}