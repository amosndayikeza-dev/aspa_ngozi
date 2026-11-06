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
        ])
        .run(tauri::generate_context!())
        .expect("Erreur fatale au lancement de Tauri");
}