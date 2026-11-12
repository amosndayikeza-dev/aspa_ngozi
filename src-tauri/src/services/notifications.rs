//! Logique métier des notifications.

use crate::error::AppError;
use chrono::{Local, NaiveDate};
use rusqlite::Connection;
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
        // 2. Alertes Stock (basées sur les lots VALIDES uniquement)
    let mut stmt = conn.prepare(
        "SELECT p.id, p.nom, p.seuil_alerte,
                COALESCE((SELECT SUM(l.quantite) FROM lots l 
                          WHERE l.produit_id = p.id 
                          AND l.date_peremption >= date('now', 'localtime')), 0) as stock_valide
         FROM produits p
         WHERE stock_valide <= p.seuil_alerte
         ORDER BY stock_valide ASC LIMIT 10"
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
        // 3. Alertes de péremption basées sur les LOTS (pas les produits)
    let mut stmt_perem = conn.prepare(
        "SELECT l.id, p.nom, l.numero_lot, l.quantite, l.date_peremption, l.produit_id
         FROM lots l
         JOIN produits p ON p.id = l.produit_id
         WHERE l.quantite > 0 AND l.date_peremption IS NOT NULL
         ORDER BY l.date_peremption ASC"
    )?;

    let perem_rows = stmt_perem.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?, // lot_id
            row.get::<_, String>(1)?, // nom produit
            row.get::<_, String>(2)?, // numero lot
            row.get::<_, i64>(3)?,    // quantite
            row.get::<_, String>(4)?, // date peremption
            row.get::<_, String>(5)?, // produit_id
        ))
    })?;

    for r in perem_rows {
        let (lot_id, nom, numero_lot, quantite, date_str, _produit_id) = r?;
        let notif_id = format!("lot-exp-{}", lot_id);
        
        if is_deleted(&notif_id) { continue; }

        if let Ok(exp_date) = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d") {
            let days_until_exp = (exp_date - today).num_days();
            let mut title = String::new();
            let mut message = String::new();
            let mut has_notif = false;

            if days_until_exp < 0 {
                title = "Lot périmé à retirer".to_string();
                message = format!(
                    "Le lot {} de '{}' ({} unités) est périmé depuis {} jours. Retirer du stock.",
                    numero_lot, nom, quantite, days_until_exp.abs()
                );
                has_notif = true;
            } else if days_until_exp <= 30 {
                title = "Lot expire bientôt".to_string();
                message = format!(
                    "Le lot {} de '{}' ({} unités) expire dans {} jours. Vendre en priorité (FEFO).",
                    numero_lot, nom, quantite, days_until_exp
                );
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

        // 4. Dettes en retard
    let mut stmt_dettes = conn.prepare(
        "SELECT d.id, c.nom || ' ' || c.prenom, d.montant_initial, d.montant_paye, d.date_echeance
         FROM dettes d
         JOIN clients c ON c.id = d.client_id
         WHERE d.statut = 'EN_COURS' AND d.date_echeance < date('now', 'localtime')
         ORDER BY d.date_echeance ASC LIMIT 10"
    )?;

    let dette_rows = stmt_dettes.query_map([], |row| {
        let id: String = row.get(0)?;
        let client_nom: String = row.get(1)?;
        let initial: f64 = row.get(2)?;
        let paye: f64 = row.get(3)?;
        let echeance: String = row.get(4)?;
        Ok((id, client_nom, initial - paye, echeance))
    })?;

    for r in dette_rows {
        let (id, client_nom, reste, echeance) = r?;
        let notif_id = format!("dette-retard-{}", id);
        
        if is_deleted(&notif_id) { continue; }

        // Calcule le nombre de jours de retard
        let jours_retard = if let Ok(date) = NaiveDate::parse_from_str(&echeance, "%Y-%m-%d") {
            (today - date).num_days()
        } else {
            0
        };

        notifications.push(NotificationPayload {
            id: notif_id.clone(),
            r#type: "DETTE".to_string(),
            title: "Dette en retard".to_string(),
            message: format!(
                "{} doit {} FBU ({} jours de retard depuis le {}).",
                client_nom, reste as i64, jours_retard, echeance
            ),
            date: now.clone(),
            is_read: is_read(&notif_id),
        });
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