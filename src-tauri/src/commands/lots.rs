//! Commandes Tauri pour la gestion des lots.

use crate::error::AppError;
use crate::services::lots::{self, LotInput, LotPayload};
use crate::services::produits;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn list_lots_by_produit(
    state: State<'_, AppState>,
    produit_id: String,
) -> Result<Vec<LotPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    lots::list_by_produit(&conn, &produit_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_lot(
    state: State<'_, AppState>,
    data: LotInput,
) -> Result<LotPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    let lot = lots::create(&conn, data).map_err(|e| e.to_string())?;
    // Recalcule le stock en cache
    produits::recalc_stock(&conn, &lot.produit_id).map_err(|e| e.to_string())?;
    Ok(lot)
}

#[tauri::command]
pub fn update_lot(
    state: State<'_, AppState>,
    id: String,
    data: LotInput,
) -> Result<LotPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    let lot = lots::update(&conn, &id, data).map_err(|e| e.to_string())?;
    produits::recalc_stock(&conn, &lot.produit_id).map_err(|e| e.to_string())?;
    Ok(lot)
}

#[tauri::command]
pub fn delete_lot(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    // Récupère le produit_id avant suppression
    let lot = lots::get_by_id(&conn, &id).map_err(|e| e.to_string())?;
    lots::delete(&conn, &id).map_err(|e| e.to_string())?;
    produits::recalc_stock(&conn, &lot.produit_id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn ajuster_lot_inventaire(
    state: State<'_, AppState>,
    lot_id: String,
    nouvelle_quantite: i64,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    crate::services::produits::ajuster_lot_inventaire(&conn, &lot_id, nouvelle_quantite)
        .map_err(|e| e.to_string())
}