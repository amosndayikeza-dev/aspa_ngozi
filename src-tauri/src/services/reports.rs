//! Logique métier des rapports financiers.

use crate::error::AppError;
use rusqlite::Connection;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportData {
    pub kpis: Kpis,
    pub historique_mensuel: Vec<HistoriqueMensuel>,
    pub performance_vendeurs: Vec<PerformanceVendeur>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Kpis {
    pub total_revenus: f64,
    pub total_depenses: f64,
    pub total_profit: f64,
    pub marge_moyenne: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoriqueMensuel {
    pub mois: String,
    pub revenus: f64,
    pub depenses: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PerformanceVendeur {
    pub nom: String,
    pub ventes: f64,
    pub objectif: f64,
}

pub fn get_report_data(conn: &Connection) -> Result<ReportData, AppError> {
    // 1. Calcul des KPIs globaux
    let total_revenus: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total), 0.0) FROM ventes", [], |r| r.get(0)
    )?;
    
    let total_depenses: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total), 0.0) FROM achats", [], |r| r.get(0)
    )?;

    let total_profit = total_revenus - total_depenses;
    
    let marge_moyenne = if total_revenus > 0.0 {
        (total_profit / total_revenus) * 100.0
    } else {
        0.0
    };

    let kpis = Kpis { total_revenus, total_depenses, total_profit, marge_moyenne };

    // 2. Historique Mensuel (Revenus et Dépenses)
    let mut historique_map: HashMap<String, (f64, f64)> = HashMap::new();

    // Revenus par mois
    let mut stmt = conn.prepare(
        "SELECT strftime('%Y-%m', date_vente) as mois, SUM(total) as total 
         FROM ventes GROUP BY mois"
    )?;
    let rows = stmt.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, f64>(1)?)))?;
    for row in rows {
        let (mois, total) = row?;
        historique_map.entry(mois).or_insert((0.0, 0.0)).0 += total;
    }

    // Dépenses par mois
    let mut stmt = conn.prepare(
        "SELECT strftime('%Y-%m', date_achat) as mois, SUM(total) as total 
         FROM achats GROUP BY mois"
    )?;
    let rows = stmt.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, f64>(1)?)))?;
    for row in rows {
        let (mois, total) = row?;
        historique_map.entry(mois).or_insert((0.0, 0.0)).1 += total;
    }

    // Transformer la HashMap en Vec trié par date
    let mut historique_mensuel = Vec::new();
    let mut mois_vec: Vec<_> = historique_map.into_iter().collect();
    mois_vec.sort_by(|a, b| a.0.cmp(&b.0)); // Trie par YYYY-MM

    for (mois, (rev, dep)) in mois_vec {
        historique_mensuel.push(HistoriqueMensuel {
            mois, revenus: rev, depenses: dep,
        });
    }

    // 3. Performance des Vendeurs
    let mut performance_vendeurs = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT u.nom, COALESCE(SUM(v.total), 0.0) as total 
         FROM users u
         LEFT JOIN ventes v ON v.user_id = u.id
         WHERE u.role IN ('VENDEUR', 'PHARMACIEN')
         GROUP BY u.id
         ORDER BY total DESC"
    )?;
    
    let rows = stmt.query_map([], |r| {
        let nom: String = r.get(0)?;
        let ventes: f64 = r.get(1)?;
        Ok(PerformanceVendeur { 
            nom, 
            ventes, 
            objectif: 500000.0 // Objectif fixe en dur (tu pourras le dynamiser plus tard)
        })
    })?;
    
    for row in rows {
        performance_vendeurs.push(row?);
    }

    Ok(ReportData { kpis, historique_mensuel, performance_vendeurs })
}