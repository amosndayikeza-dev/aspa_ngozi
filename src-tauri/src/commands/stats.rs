//! Commandes Tauri pour alimenter les tableaux de bord.

use crate::error::AppError;
use crate::services::stats::{self, AdminStats, PharmacistStats, SellerStats};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_pharmacist_stats(state: State<'_, AppState>) -> Result<PharmacistStats, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    stats::get_pharmacist_stats(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_seller_stats(state: State<'_, AppState>, user_id: String) -> Result<SellerStats, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    stats::get_seller_stats(&conn, &user_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_admin_stats(state: State<'_, AppState>) -> Result<AdminStats, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    stats::get_admin_stats(&conn).map_err(|e| e.to_string())
}