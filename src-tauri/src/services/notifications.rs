//! Logique métier des notifications.

use crate::error::AppError;
use chrono::{Local, NaiveDate};
use rusqlite::{params, Connection};
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationPayload {
    pub id: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub title: String,
    pub message: String,
    pub date: String,
    pub is_read: bool,
}

/// Récupère les notifications en appliquant les états (lu/supprimé).
pub fn get_notifications(conn: &Connection) -> Result<Vec<NotificationPayload>, AppError> {
    let mut notifications = Vec::new();
    let now = Local::now().to_rfc3339();
    let today = Local::now().date_naive();

    // 1. Récupérer les états existants en base
    let mut stmt_states = conn.prepare("SELECT id, is_read, is_deleted FROM notifications_states")?;
    let states: HashMap<String, (bool, bool)> = stmt_states
        .query_map([], |r| {
            Ok((
                r.get::<_, String>(0)?,
                (r.get::<_, i64>(1)? == 1, r.get::<_, i64>(2)? == 1),
            ))
        })?
        .filter_map(|r| r.ok())
        .collect();

    // Helper pour vérifier si une notif est supprimée
    let is_deleted = |id: &str| -> bool {
        states.get(id).map(|(_, deleted)| *deleted).unwrap_or(false)
    };

    // Helper pour vérifier si une notif est lue
    let is_read = |id: &str| -> bool {
        states.get(id).map(|(read, _)| *read).unwrap_or(false)
    };

    // 2. Alertes Stock
    let mut stmt = conn.prepare(
        "SELECT id, nom, stock, seuil_alerte FROM produits 
         WHERE stock <= seuil_alerte ORDER BY stock ASC LIMIT 10"
    )?;
    
    let stock_rows = stmt.query_map([], |row| {
        let id: String = row.get(0)?;
        let nom: String = row.get(1)?;
        let stock: i64 = row.get(2)?;
        
        let (title, message) = if stock == 0 {
            ("Rupture de stock".to_string(), format!("Le produit '{}' est épuisé.", nom))
        } else {
            ("Stock critique".to_string(), format!("Le produit '{}' n'a plus que {} unités.", nom, stock))
        };

        Ok(NotificationPayload {
            id: format!("stock-{}", id),
            r#type: "STOCK".to_string(),
            title,
            message,
            date: now.clone(),
            is_read: false,
        })
    })?;

    for r in stock_rows {
        let n = r?;
        if !is_deleted(&n.id) {
            let read = is_read(&n.id);
            notifications.push(NotificationPayload { is_read: read, ..n });
        }
    }

    // 3. Alertes Péremption
    let mut stmt_perem = conn.prepare(
        "SELECT id, nom, date_peremption FROM produits 
         WHERE date_peremption IS NOT NULL AND date_peremption != ''"
    )?;

    let perem_rows = stmt_perem.query_map([], |row| {
        let id: String = row.get(0)?;
        let nom: String = row.get(1)?;
        let date_str: String = row.get(2)?;
        Ok((id, nom, date_str))
    })?;

    for r in perem_rows {
        let (id, nom, date_str) = r?;
        let notif_id = format!("exp-{}", id);
        
        if is_deleted(&notif_id) { continue; }

        if let Ok(exp_date) = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d") {
            let days_until_exp = (exp_date - today).num_days();
            let mut title = String::new();
            let mut message = String::new();
            let mut has_notif = false;

            if days_until_exp < 0 {
                title = "Produit périmé !".to_string();
                message = format!("Le produit '{}' a expiré le {}.", nom, date_str);
                has_notif = true;
            } else if days_until_exp <= 30 {
                title = "Péremption imminente".to_string();
                message = format!("Le produit '{}' expire dans {} jours.", nom, days_until_exp);
                has_notif = true;
            }

            if has_notif {
                notifications.push(NotificationPayload {
                    id: notif_id.clone(),
                    r#type: "PEREMPTION".to_string(),
                    title, message,
                    date: now.clone(),
                    is_read: is_read(&notif_id),
                });
            }
        }
    }

    // 4. Système
    let sys_id = "sys-welcome".to_string();
    if !is_deleted(&sys_id) {
        notifications.push(NotificationPayload {
            id: sys_id.clone(),
            r#type: "SYSTEME".to_string(),
            title: "Système opérationnel".to_string(),
            message: "La base de données locale est synchronisée.".to_string(),
            date: now.clone(),
            is_read: is_read(&sys_id),
        });
    }

    // Trier par date (les plus récentes d'abord, mais ici elles ont toutes la même date)
    Ok(notifications)
}

/// Marque une notification spécifique comme lue.
pub fn mark_as_read(conn: &Connection, id: &str) -> Result<(), AppError> {
    conn.execute(
        "INSERT INTO notifications_states (id, is_read) VALUES (?1, 1)
         ON CONFLICT(id) DO UPDATE SET is_read = 1",
        [id],
    )?;
    Ok(())
}

/// Marque toutes les notifications comme lues.
pub fn mark_all_as_read(conn: &Connection) -> Result<(), AppError> {
    let notifications = get_notifications(conn)?;
    for n in notifications {
        if !n.is_read {
            mark_as_read(conn, &n.id)?;
        }
    }
    Ok(())
}

/// Marque une notification comme supprimée.
pub fn delete_notification(conn: &Connection, id: &str) -> Result<(), AppError> {
    conn.execute(
        "INSERT INTO notifications_states (id, is_deleted) VALUES (?1, 1)
         ON CONFLICT(id) DO UPDATE SET is_deleted = 1",
        [id],
    )?;
    Ok(())
}