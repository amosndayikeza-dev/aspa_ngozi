//! Gestion centralisée des erreurs métier et techniques.
//!
//! Toutes les erreurs internes remontent ici via `thiserror`. À la frontière
//! des commandes Tauri (dans `commands/`), elles sont converties en `String`
//! claire que React reçoit dans le `catch` de `invoke`.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    /// Erreur SQLite (connexion, requête, contrainte, etc.).
    #[error("Erreur de base de données : {0}")]
    Database(#[from] rusqlite::Error),

    /// Erreur d'entrée/sortie (création de dossier, écriture fichier, etc.).
    #[error("Erreur d'entrée/sortie : {0}")]
    Io(#[from] std::io::Error),

    /// Erreur interne liée au hachage bcrypt.
    #[error("Erreur de hachage : {0}")]
    Hash(String),

    /// Identifiants invalides (email inconnu OU mot de passe faux).
    /// ⚠️ On renvoie le même message dans les deux cas pour ne pas
    ///    révéler l'existence d'un compte (bonne pratique sécurité).
    #[error("Email ou mot de passe incorrect")]
    InvalidCredentials,

    /// L'état applicatif n'a pas pu être lu (verrou Mutex empoisonné).
    #[error("État applicatif indisponible")]
    StateUnavailable,

    /// Erreur générique non catégorisée.
    #[error("{0}")]
    Other(String),
}