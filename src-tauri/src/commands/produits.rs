//! Commandes Tauri pour la gestion des produits.

use crate::error::AppError;
use crate::services::produits::{self, ProduitInput, ProduitPayload};
use crate::state::AppState;
use tauri::State;

/// Récupère tous les produits.
#[tauri::command]
pub fn list_produits(state: State<'_, AppState>) -> Result<Vec<ProduitPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    produits::list(&conn).map_err(|e| e.to_string())
}

/// Récupère un produit par son ID.
#[tauri::command]
pub fn get_produit(state: State<'_, AppState>, id: String) -> Result<ProduitPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    produits::get(&conn, &id).map_err(|e| e.to_string())
}

/// Crée un nouveau produit.
#[tauri::command]
pub fn create_produit(state: State<'_, AppState>, data: ProduitInput) -> Result<ProduitPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    produits::create(&conn, data).map_err(|e| e.to_string())
}

/// Met à jour un produit existant.
#[tauri::command]
pub fn update_produit(state: State<'_, AppState>, id: String, data: ProduitInput) -> Result<ProduitPayload, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    produits::update(&conn, &id, data).map_err(|e| e.to_string())
}

/// Supprime un produit.
#[tauri::command]
pub fn delete_produit(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    produits::delete(&conn, &id).map_err(|e| e.to_string())
}

/// Récupère la liste des produits en alerte de stock.
#[tauri::command]
pub fn check_alertes_stock(state: State<'_, AppState>) -> Result<Vec<ProduitPayload>, String> {
    let conn = state.db.lock().map_err(|_| AppError::StateUnavailable.to_string())?;
    produits::check_alertes_stock(&conn).map_err(|e| e.to_string())
}