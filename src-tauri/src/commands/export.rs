use crate::error::AppError;
use crate::services::export;
use crate::state::AppState;
use tauri::{State, AppHandle, Manager};

#[tauri::command]
pub fn export_ventes_csv(state: State<'_, AppState>, app: AppHandle) -> Result<String, String> {
    // On sauvegarde le fichier sur le Bureau de l'utilisateur
    let desktop_path = app.path().desktop_dir()
        .map_err(|e| format!("Dossier introuvable: {}", e))?
        .join("ventes_vetpharma.csv");

    let path_str = desktop_path.to_string_lossy().to_string();

    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    export::export_ventes_csv(&conn, &path_str).map_err(|e| e.to_string())?;

    Ok(path_str)
}