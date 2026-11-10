//! Commandes Tauri pour la gestion des utilisateurs (Admin).

use crate::error::AppError;
use crate::services::users::{self, UserInput, UserPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn list_users(state: State<'_, AppState>) -> Result<Vec<UserPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    users::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_user(state: State<'_, AppState>, data: UserInput, current_user_role: String) -> Result<UserPayload, String> {
    if current_user_role != "ADMIN" {
        return Err("Action réservée aux administrateurs".to_string());
    }
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    users::create(&conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_user(state: State<'_, AppState>, id: String, data: UserInput, current_user_role: String) -> Result<UserPayload, String> {
    if current_user_role != "ADMIN" {
        return Err("Action réservée aux administrateurs".to_string());
    }
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    users::update(&conn, &id, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn toggle_user_actif(state: State<'_, AppState>, id: String, actif: bool, current_user_role: String) -> Result<(), String> {
    if current_user_role != "ADMIN" {
        return Err("Action réservée aux administrateurs".to_string());
    }
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    users::toggle_actif(&conn, &id, actif).map_err(|e| e.to_string())
}