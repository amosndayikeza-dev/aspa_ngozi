//! État applicatif partagé, injecté dans les commandes Tauri via `app.manage()`.
//!
//! `rusqlite::Connection` n'est **pas** `Sync` → on l'enferme dans un `Mutex`
//! pour pouvoir le partager entre threads (Tauri peut invoquer des commandes
//! depuis plusieurs threads). Chaque commande prend un verrou court le temps
//! de la requête SQL, puis le relâche automatiquement.

use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Connection>,
}