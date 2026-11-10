//! Commandes Tauri pour les notifications.

use crate::error::AppError;
use crate::services::notifications::{self, NotificationPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_notifications(state: State<'_, AppState>) -> Result<Vec<NotificationPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    notifications::get_notifications(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn mark_notification_read(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    notifications::mark_as_read(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn mark_all_notifications_read(state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    notifications::mark_all_as_read(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_notification(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    notifications::delete_notification(&conn, &id).map_err(|e| e.to_string())
}