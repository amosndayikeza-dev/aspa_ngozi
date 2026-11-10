use crate::error::AppError;
use crate::services::achats::{self, AchatInput, AchatPayload};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn create_achat(state: State<'_, AppState>, data: AchatInput) -> Result<AchatPayload, String> {
    // On a besoin de `mut conn` car `transaction()` modifie l'état de la connexion
    let mut conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    achats::create(&mut conn, data).map_err(|e| e.to_string())
}