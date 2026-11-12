//! Logique métier des statistiques et du Dashboard.

use crate::error::AppError;
use chrono::{Duration, Local};
use rusqlite::Connection;
use serde::Serialize;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES DE RETOUR (mappées sur le frontend React)
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PharmacistStats {
    pub kpis: Kpis,
    pub ventes_semaine: Vec<DayVentes>,
    pub repartition_categories: Vec<CategoryCA>,
    pub top_produits: Vec<TopProduct>,
    pub total_creances: f64,       
    pub nb_dettes_retard: i64, 
    pub valeur_stock: f64,        
    pub valeur_stock_perime: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Kpis {
    pub ca_jour: f64,
    pub ca_semaine: f64,
    pub benefice_mois: f64,
    pub clients_servis: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DayVentes {
    pub jour: String,
    pub ventes: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryCA {
    pub name: String,
    pub value: f64,
    pub color: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TopProduct {
    pub nom: String,
    pub ventes: i64,
    pub ca: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SellerStats {
    pub mes_ventes_jour: f64,
    pub mes_clients_servis: i64,
    pub mes_objectifs: f64,
    pub alertes_stock: Vec<AlertStock>,
    pub recent_ventes: Vec<RecentVente>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AlertStock {
    pub nom: String,
    pub raison: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentVente {
    pub id: String,
    pub heure: String,
    pub total: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminStats {
    pub users_actifs: i64,
    pub taille_db: String,
    pub uptime: String,
    pub version: String,
    pub recent_logs: Vec<LogEntry>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    pub action: String,
    pub user: String,
    pub time: String,
    #[serde(rename = "type")]
    pub r#type: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS PHARMACIEN (Dashboard principal)
// ─────────────────────────────────────────────────────────────────────────────

pub fn get_pharmacist_stats(conn: &Connection) -> Result<PharmacistStats, AppError> {
    // 1. KPIs principaux
    let ca_jour: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total), 0) FROM ventes WHERE date(date_vente) = date('now', 'localtime')",
        [], |row| row.get(0),
    )?;

    let ca_semaine: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total), 0) FROM ventes WHERE date(date_vente) >= date('now', 'localtime', '-7 days')",
        [], |row| row.get(0),
    )?;

    let benefice_mois: f64 = conn.query_row(
        "SELECT COALESCE(SUM((vl.prix_unitaire - p.prix_achat) * vl.quantite), 0) 
         FROM ventes v
         JOIN ventes_lignes vl ON vl.vente_id = v.id
         JOIN produits p ON p.id = vl.produit_id
         WHERE strftime('%Y-%m', v.date_vente) = strftime('%Y-%m', 'now', 'localtime')",
        [], |row| row.get(0),
    )?;

    let clients_servis: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT client_id) FROM ventes WHERE date(date_vente) = date('now', 'localtime')",
        [], |row| row.get(0),
    )?;

    let kpis = Kpis { ca_jour, ca_semaine, benefice_mois, clients_servis };

    // 2. Évolution des ventes sur 7 jours
    let mut ventes_semaine = Vec::new();
    let jours_fr = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    
    for i in (0..7).rev() {
        let date = Local::now() - Duration::days(i);
        let date_str = date.format("%Y-%m-%d").to_string();
        let jour_index = date.format("%w").to_string().parse::<usize>().unwrap_or(0);
        
        let ventes: f64 = conn.query_row(
            "SELECT COALESCE(SUM(total), 0) FROM ventes WHERE date(date_vente) = ?1",
            [&date_str],
            |row| row.get(0),
        )?;
        ventes_semaine.push(DayVentes { jour: jours_fr[jour_index].to_string(), ventes });
    }

    // 3. Répartition par catégorie
    let couleurs = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    let mut repartition_categories = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT COALESCE(p.categorie, 'Autre') as cat, COALESCE(SUM(vl.sous_total), 0) as total
         FROM ventes_lignes vl
         JOIN produits p ON p.id = vl.produit_id
         GROUP BY p.categorie
         ORDER BY total DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))
    })?;
    for (i, row) in rows.enumerate() {
        let (name, value) = row?;
        if value > 0.0 {
            repartition_categories.push(CategoryCA {
                name, value, color: couleurs[i % couleurs.len()].to_string(),
            });
        }
    }

    // 4. Top 5 des produits
    let mut top_produits = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT p.nom, SUM(vl.quantite) as qte, SUM(vl.sous_total) as ca
         FROM ventes_lignes vl
         JOIN produits p ON p.id = vl.produit_id
         GROUP BY p.id
         ORDER BY qte DESC
         LIMIT 5"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(TopProduct {
            nom: row.get(0)?,
            ventes: row.get(1)?,
            ca: row.get(2)?,
        })
    })?;
    for row in rows { top_produits.push(row?); }

        // 5. Total créances (dettes en cours)
        let total_creances: f64 = conn.query_row(
            "SELECT COALESCE(SUM(montant_initial - montant_paye), 0.0) 
            FROM dettes WHERE statut = 'EN_COURS'",
            [],
            |row| row.get(0),
        ).unwrap_or(0.0);

        // 6. Nombre de dettes en retard
        let nb_dettes_retard: i64 = conn.query_row(
            "SELECT COUNT(*) FROM dettes 
            WHERE statut = 'EN_COURS' AND date_echeance < date('now', 'localtime')",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

            // 7. Valeur du stock VALIDE (lots non périmés × prix d'achat)
    let valeur_stock: f64 = conn.query_row(
        "SELECT COALESCE(SUM(l.quantite * l.prix_achat), 0.0)
         FROM lots l
         WHERE l.quantite > 0 
           AND l.date_peremption >= date('now', 'localtime')",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    // 8. Valeur du stock PÉRIMÉ (à jeter, perte sèche)
    let valeur_stock_perime: f64 = conn.query_row(
        "SELECT COALESCE(SUM(l.quantite * l.prix_achat), 0.0)
         FROM lots l
         WHERE l.quantite > 0 
           AND l.date_peremption < date('now', 'localtime')",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    Ok(PharmacistStats {
        kpis,
        ventes_semaine,
        repartition_categories,
        top_produits,
        total_creances,
        nb_dettes_retard,
        valeur_stock,          
        valeur_stock_perime,   
    })

}


// ─────────────────────────────────────────────────────────────────────────────
// STATS VENDEUR
// ─────────────────────────────────────────────────────────────────────────────

pub fn get_seller_stats(conn: &Connection, user_id: &str) -> Result<SellerStats, AppError> {
    // Ventes du jour pour ce vendeur
    let mes_ventes_jour: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total), 0) FROM ventes 
         WHERE user_id = ?1 AND date(date_vente) = date('now', 'localtime')",
        [user_id], |row| row.get(0),
    )?;

    // Clients servis par ce vendeur aujourd'hui
    let mes_clients_servis: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT client_id) FROM ventes 
         WHERE user_id = ?1 AND date(date_vente) = date('now', 'localtime')",
        [user_id], |row| row.get(0),
    )?;

    // Alertes stock (uniquement les 3 plus critiques pour ne pas surcharger)
    let mut alertes_stock = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT nom, stock, seuil_alerte FROM produits 
         WHERE stock <= seuil_alerte 
         ORDER BY stock ASC LIMIT 3"
    )?;
    let rows = stmt.query_map([], |row| {
        let nom: String = row.get(0)?;
        let stock: i64 = row.get(1)?;
        Ok(AlertStock {
            nom,
            raison: if stock == 0 { "Rupture de stock".to_string() } else { format!("Stock critique ({} restants)", stock) },
        })
    })?;
    for row in rows { alertes_stock.push(row?); }

    // Dernières ventes du vendeur
    let mut recent_ventes = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT id, date_vente, total FROM ventes 
         WHERE user_id = ?1 
         ORDER BY created_at DESC LIMIT 5"
    )?;
    let rows = stmt.query_map([user_id], |row| {
        let date_str: String = row.get(1)?;
        // On extrait juste l'heure (format HH:MM) si possible
        let heure = date_str.split(' ').nth(1).unwrap_or("--:--").to_string();
        Ok(RecentVente {
            id: row.get(0)?,
            heure,
            total: row.get(2)?,
        })
    })?;
    for row in rows { recent_ventes.push(row?); }

    Ok(SellerStats {
        mes_ventes_jour,
        mes_clients_servis,
        mes_objectifs: 200000.0, // Objectif fixe pour l'instant, paramétrable plus tard
        alertes_stock,
        recent_ventes,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS ADMIN
// ─────────────────────────────────────────────────────────────────────────────

pub fn get_admin_stats(conn: &Connection) -> Result<AdminStats, AppError> {
    let users_actifs: i64 = conn.query_row(
        "SELECT COUNT(*) FROM users WHERE actif = 1", [], |row| row.get(0),
    )?;

    // Logs simulés (l'audit n'est pas encore implémenté en base)
    let recent_logs = vec![
        LogEntry { action: "Connexion réussie".into(), user: "Admin Système".into(), time: "Il y a 5 min".into(), r#type: "SUCCESS".into() },
        LogEntry { action: "Création d'un compte vendeur".into(), user: "Admin Système".into(), time: "Il y a 2h".into(), r#type: "INFO".into() },
        LogEntry { action: "Tentative de connexion échouée".into(), user: "inconnu@mail.com".into(), time: "Il y a 3h".into(), r#type: "WARNING".into() },
    ];

    Ok(AdminStats {
        users_actifs,
        taille_db: "SQLite Local".to_string(),
        uptime: "99.9%".to_string(),
        version: "v1.0.0".to_string(),
        recent_logs,
    })
}