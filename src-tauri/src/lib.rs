//! Point d'entrée de la lib Tauri v2.
//! `main.rs` ne fait qu'appeler `run()`.

mod commands;
mod db;
mod error;
mod services;
mod state;
mod utils;

use state::AppState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Ouvre / crée la DB, applique le schéma, seed les 3 comptes.
            let conn = db::init_db(app.handle())?;
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Phase 0 — health checks
            commands::system::ping,
            commands::system::db_health,
            // Phase 1 — authentification
            commands::auth::login,
            commands::auth::logout,

            //phase 2 -Produits
            commands::produits::list_produits,
            commands::produits::get_produit,
            commands::produits::create_produit,
            commands::produits::update_produit,
            commands::produits::delete_produit,
            commands::produits::check_alertes_stock,
            
            //phase 3 -Clients
            commands::clients::list_clients,
            commands::clients::get_client,
            commands::clients::search_clients,
            commands::clients::create_client,
            commands::clients::update_client,
            commands::clients::delete_client,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur fatale au lancement de Tauri");
}