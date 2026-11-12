//! Logique métier pure, indépendante de Tauri (testable en isolation).
//!
//! Les modules (`auth`, `produits`, `clients`, …) seront ajoutés au fur et
//! à mesure des phases. Pour l'instant, ce module est vide.

pub mod achats;
pub mod animaux;
pub mod auth;
pub mod clients;
pub mod fournisseurs; 
pub mod produits;
pub mod ventes;
pub mod users;
pub mod stats;
pub mod ordonnances;
pub mod export;
pub mod parametres;
pub mod notifications;
pub mod reports;
pub mod audit;
pub mod dettes;
pub mod lots; 