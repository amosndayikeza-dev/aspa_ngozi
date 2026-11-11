//! Commandes Tauri pour le journal d'audit.

use crate::error::AppError;
use crate::services::audit::{self, AuditLogPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_audit_logs(state: State<'_, AppState>) -> Result<Vec<AuditLogPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    audit::list_logs(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_audit_log(
    state: State<'_, AppState>,
    user_id: String,
    action: String,
    module: String,
    details: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    audit::create_log(&conn, &user_id, &action, &module, &details).map_err(|e| e.to_string())
}