//! Logique métier du journal d'audit.

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogPayload {
    pub id: String,
    pub date: String, // On renomme created_at en date pour React
    pub user_nom: String,
    pub user_role: String,
    pub action: String,
    pub module: String,
    pub details: String,
}

/// Enregistre une action dans le journal d'audit.
pub fn create_log(
    conn: &Connection,
    user_id: &str,
    action: &str,
    module: &str,
    details: &str,
) -> Result<(), AppError> {
    let id = format!("LOG-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO audit_logs (id, user_id, action, module, details, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, user_id, action, module, details, now],
    )?;

    Ok(())
}

/// Récupère l'historique complet des logs.
pub fn list_logs(conn: &Connection) -> Result<Vec<AuditLogPayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT al.id, al.created_at, u.nom, u.role, al.action, al.module, al.details
         FROM audit_logs al
         JOIN users u ON u.id = al.user_id
         ORDER BY al.created_at DESC
         LIMIT 100" // On limite aux 100 derniers pour la performance
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(AuditLogPayload {
            id: row.get(0)?,
            date: row.get(1)?,
            user_nom: row.get(2)?,
            user_role: row.get(3)?,
            action: row.get(4)?,
            module: row.get(5)?,
            details: row.get(6)?,
        })
    })?;

    let mut logs = Vec::new();
    for r in rows {
        logs.push(r?);
    }
    Ok(logs)
}