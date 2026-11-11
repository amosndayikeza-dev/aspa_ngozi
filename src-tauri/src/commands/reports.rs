//! Commandes Tauri pour les rapports.

use crate::error::AppError;
use crate::services::reports::{self, ReportData};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_report_data(state: State<'_, AppState>) -> Result<ReportData, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    reports::get_report_data(&conn).map_err(|e| e.to_string())
}