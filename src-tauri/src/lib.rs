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
            
            //phase 4 -Animaux
            commands::animaux::list_animaux_by_client,
            commands::animaux::get_animal,
            commands::animaux::create_animal,
            commands::animaux::update_animal,
            commands::animaux::delete_animal,

            //phase 5 : fournisseurs et achats
            commands::fournisseurs::list_fournisseurs,
            commands::fournisseurs::create_fournisseur,
            commands::fournisseurs::update_fournisseur,
            commands::fournisseurs::delete_fournisseur,
            commands::achats::create_achat,
        
            //phase 6 : ventes
            commands::ventes::create_vente,
            commands::ventes::list_ventes,
        
            //phahe 7 : users
            commands::users::list_users,
            commands::users::create_user,
            commands::users::update_user,
            commands::users::toggle_user_actif,
        
            commands::stats::get_pharmacist_stats,
            commands::stats::get_seller_stats,
            commands::stats::get_admin_stats,
            
            // Phase 9 — Ordonnances & Export
            commands::ordonnances::create_ordonnance,
            commands::ordonnances::list_ordonnances,
            commands::export::export_ventes_csv,
            commands::ordonnances::get_ordonnance,

            // Phase 10 — Paramètres
            commands::parametres::get_parametres,
            commands::parametres::update_parametres,

            // Phase 11 — Notifications
            commands::notifications::get_notifications,
            commands::notifications::mark_notification_read,
            commands::notifications::mark_all_notifications_read,
            commands::notifications::delete_notification,

        ])
        .run(tauri::generate_context!())
        .expect("Erreur fatale au lancement de Tauri");
}