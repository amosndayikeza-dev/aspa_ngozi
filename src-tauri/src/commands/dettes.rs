//! Commandes Tauri pour les dettes.

use crate::error::AppError;
use crate::services::dettes::{self, DettePayload, PaiementInput, PaiementPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn list_dettes(
    state: State<'_, AppState>,
    statut: Option<String>,
    client_id: Option<String>,
) -> Result<Vec<DettePayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    dettes::list(&conn, statut.as_deref(), client_id.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_dette(state: State<'_, AppState>, id: String) -> Result<DettePayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    dettes::get_by_id(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn enregistrer_paiement_dette(
    state: State<'_, AppState>,
    data: PaiementInput,
) -> Result<DettePayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    dettes::enregistrer_paiement(&conn, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_paiements_dette(
    state: State<'_, AppState>,
    dette_id: String,
) -> Result<Vec<PaiementPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    dettes::list_paiements(&conn, &dette_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_total_creances(state: State<'_, AppState>) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    dettes::get_total_creances(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_total_du_by_client(
    state: State<'_, AppState>,
    client_id: String,
) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    dettes::get_total_du_by_client(&conn, &client_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_nb_dettes_retard(state: State<'_, AppState>) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM dettes 
         WHERE statut = 'EN_COURS' AND date_echeance < date('now', 'localtime')",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    Ok(count)
}