//! Logique métier des ventes avec FEFO (First Expired, First Out).

use crate::error::AppError;
use chrono::Local;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneVenteInput {
    pub produit_id: String,
    pub quantite: i64,
    pub prix_unitaire: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditInfo {
    pub montant_verse: f64,
    pub mode_versement: String,
    pub date_echeance: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VenteInput {
    pub client_id: String,
    pub animal_id: Option<String>,
    pub user_id: String,
    pub mode_paiement: String,
    pub lignes: Vec<LigneVenteInput>,
    pub credit: Option<CreditInfo>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VentePayload {
    pub id: String,
    pub client_id: String,
    pub animal_id: Option<String>,
    pub user_id: String,
    pub total: f64,
    pub mode_paiement: String,
    pub date_vente: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VenteDetailPayload {
    pub id: String,
    pub date_vente: String,
    pub client_nom: String,
    pub user_nom: String,
    pub total: f64,
    pub mode_paiement: String,
    pub lignes: Vec<LigneVenteDetail>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneVenteDetail {
    pub nom_produit: String,
    pub numero_lot: Option<String>,
    pub quantite: i64,
    pub prix_unitaire: f64,
    pub sous_total: f64,
}

/// Crée une vente avec gestion FEFO (First Expired, First Out).
///
/// Pour chaque produit :
/// 1. Récupère les lots triés par date de péremption croissante
/// 2. Filtre les lots VALIDES (non périmés, quantité > 0)
/// 3. Refuse la vente si stock valide insuffisant
/// 4. Décrémente les lots en commençant par le plus proche de la péremption
/// 5. Enregistre chaque "prise" dans ventes_lignes avec son lot_id
pub fn create(conn: &mut Connection, input: VenteInput) -> Result<VentePayload, AppError> {
    if input.lignes.is_empty() {
        return Err(AppError::Other("La vente ne contient aucun produit".to_string()));
    }
    for ligne in &input.lignes {
        if ligne.quantite <= 0 {
            return Err(AppError::Other("La quantité doit être supérieure à 0".to_string()));
        }
    }

    // Démarrer la transaction
    let tx = conn.transaction()?;

    let id = format!("V-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    let date_vente = Local::now().format("%Y-%m-%d %H:%M").to_string();
    let total: f64 = input.lignes.iter().map(|l| l.quantite as f64 * l.prix_unitaire).sum();

    // 1. Insérer la vente
    tx.execute(
        "INSERT INTO ventes (id, client_id, animal_id, user_id, total, mode_paiement, date_vente, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, input.client_id, input.animal_id, input.user_id, total, input.mode_paiement, date_vente, now],
    )?;

    // 2. Appliquer le FEFO pour chaque ligne
    let mut produits_touches: Vec<String> = Vec::new();

    for ligne in &input.lignes {
        // 2a. Vérifier que le produit existe
        let produit_existe: i64 = tx.query_row(
            "SELECT COUNT(*) FROM produits WHERE id = ?1",
            [&ligne.produit_id],
            |row| row.get(0),
        )?;
        if produit_existe == 0 {
            return Err(AppError::Other(format!("Produit {} introuvable", ligne.produit_id)));
        }

        // 2b. Récupérer les lots valides triés par date (FEFO)
        let mut stmt = tx.prepare(
            "SELECT id, numero_lot, quantite, date_peremption 
             FROM lots 
             WHERE produit_id = ?1 AND quantite > 0 
               AND date_peremption >= date('now', 'localtime')
             ORDER BY date_peremption ASC"
        )?;

        let lots: Vec<(String, String, i64, String)> = stmt
            .query_map([&ligne.produit_id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i64>(2)?,
                    row.get::<_, String>(3)?,
                ))
            })?
            .filter_map(|r| r.ok())
            .collect();

        // 2c. Vérifier le stock valide total
        let stock_valide_total: i64 = lots.iter().map(|(_, _, q, _)| *q).sum();
        if stock_valide_total < ligne.quantite {
            let nom_produit: String = tx.query_row(
                "SELECT nom FROM produits WHERE id = ?1",
                [&ligne.produit_id],
                |row| row.get(0),
            ).unwrap_or_else(|_| ligne.produit_id.clone());

            return Err(AppError::Other(format!(
                "Stock valide insuffisant pour '{}'. Demandé : {}, Disponible : {} (les lots périmés ne peuvent pas être vendus)",
                nom_produit, ligne.quantite, stock_valide_total
            )));
        }

        // 2d. Décrémenter les lots en FEFO
        let mut reste_a_prendre = ligne.quantite;

        for (lot_id, numero_lot, quantite_lot, date_exp) in &lots {
            if reste_a_prendre <= 0 {
                break;
            }

            let a_prendre = std::cmp::min(reste_a_prendre, *quantite_lot);
            let nouvelle_quantite = quantite_lot - a_prendre;

            // Décrémenter le lot
            tx.execute(
                "UPDATE lots SET quantite = ?1 WHERE id = ?2",
                params![nouvelle_quantite, lot_id],
            )?;

            // Enregistrer la ligne de vente avec lot_id
            let ligne_id = format!("LV-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
            let sous_total = a_prendre as f64 * ligne.prix_unitaire;

            tx.execute(
                "INSERT INTO ventes_lignes (id, vente_id, produit_id, lot_id, quantite, prix_unitaire, sous_total) 
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![ligne_id, id, ligne.produit_id, lot_id, a_prendre, ligne.prix_unitaire, sous_total],
            )?;

            reste_a_prendre -= a_prendre;
            println!("✅ FEFO : {} unités du lot {} (exp: {})", a_prendre, numero_lot, date_exp);
        }

        produits_touches.push(ligne.produit_id.clone());
    }

    // 3. Recalculer le cache `produits.stock` pour chaque produit touché
    produits_touches.sort();
    produits_touches.dedup();
    for produit_id in &produits_touches {
        let nouveau_stock: i64 = tx.query_row(
            "SELECT COALESCE(SUM(quantite), 0) FROM lots WHERE produit_id = ?1",
            [produit_id],
            |row| row.get(0),
        )?;
        tx.execute(
            "UPDATE produits SET stock = ?1 WHERE id = ?2",
            params![nouveau_stock, produit_id],
        )?;
    }

    // 4. Gestion du crédit
    if let Some(credit_info) = &input.credit {
        if credit_info.montant_verse < 0.0 || credit_info.montant_verse > total + 0.01 {
            return Err(AppError::Other(
                "Le montant versé est invalide (doit être entre 0 et le total)".to_string()
            ));
        }

        use crate::services::dettes::{self, CreateDetteInput};
        dettes::create_from_vente(&tx, CreateDetteInput {
            vente_id: id.clone(),
            client_id: input.client_id.clone(),
            montant_initial: total,
            montant_paye: credit_info.montant_verse,
            mode_paiement: credit_info.mode_versement.clone(),
            date_echeance: credit_info.date_echeance.clone(),
            user_id: input.user_id.clone(),
        })?;
    }

    // 5. Log audit
    let log_details = format!(
        "Vente {} effectuée. Total : {} FBU ({} article(s))",
        id, total, input.lignes.len()
    );
    crate::services::audit::create_log(
        &tx,
        &input.user_id,
        "CREATE",
        "Ventes",
        &log_details,
    )?;

    // 6. Valider
    tx.commit()?;

    Ok(VentePayload {
        id,
        client_id: input.client_id,
        animal_id: input.animal_id,
        user_id: input.user_id,
        total,
        mode_paiement: input.mode_paiement,
        date_vente,
    })
}

/// Liste l'historique global (dashboard admin).
pub fn list_history(conn: &Connection) -> Result<Vec<VentePayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, client_id, animal_id, user_id, total, mode_paiement, date_vente 
         FROM ventes ORDER BY created_at DESC LIMIT 100"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(VentePayload {
            id: row.get(0)?, client_id: row.get(1)?, animal_id: row.get(2)?,
            user_id: row.get(3)?, total: row.get(4)?, mode_paiement: row.get(5)?, date_vente: row.get(6)?,
        })
    })?;

    let mut ventes = Vec::new();
    for r in rows { ventes.push(r?); }
    Ok(ventes)
}

/// Liste les ventes d'un vendeur spécifique.
pub fn list_by_user(conn: &Connection, user_id: &str) -> Result<Vec<VentePayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, client_id, animal_id, user_id, total, mode_paiement, date_vente 
         FROM ventes WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 100"
    )?;

    let rows = stmt.query_map([user_id], |row| {
        Ok(VentePayload {
            id: row.get(0)?, client_id: row.get(1)?, animal_id: row.get(2)?,
            user_id: row.get(3)?, total: row.get(4)?, mode_paiement: row.get(5)?, date_vente: row.get(6)?,
        })
    })?;

    let mut ventes = Vec::new();
    for r in rows { ventes.push(r?); }
    Ok(ventes)
}

/// Récupère le détail complet d'une vente (avec lot_id pour traçabilité).
pub fn get_detail(conn: &Connection, vente_id: &str) -> Result<VenteDetailPayload, AppError> {
    let (id, date_vente, client_nom, user_nom, total, mode_paiement) = conn.query_row(
        "SELECT v.id, v.date_vente, c.nom || ' ' || c.prenom, u.nom, v.total, v.mode_paiement
         FROM ventes v
         JOIN clients c ON c.id = v.client_id
         JOIN users u ON u.id = v.user_id
         WHERE v.id = ?1",
        [vente_id],
        |row| Ok((
            row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?,
            row.get::<_, String>(3)?, row.get::<_, f64>(4)?, row.get::<_, String>(5)?,
        )),
    ).map_err(|_| AppError::Other("Vente introuvable".to_string()))?;

    let mut stmt = conn.prepare(
        "SELECT p.nom, l.numero_lot, vl.quantite, vl.prix_unitaire, vl.sous_total
         FROM ventes_lignes vl
         JOIN produits p ON p.id = vl.produit_id
         LEFT JOIN lots l ON l.id = vl.lot_id
         WHERE vl.vente_id = ?1
         ORDER BY vl.id"
    )?;

    let rows = stmt.query_map([vente_id], |row| {
        Ok(LigneVenteDetail {
            nom_produit: row.get(0)?,
            numero_lot: row.get(1)?,
            quantite: row.get(2)?,
            prix_unitaire: row.get(3)?,
            sous_total: row.get(4)?,
        })
    })?;

    let mut lignes = Vec::new();
    for r in rows { lignes.push(r?); }

    Ok(VenteDetailPayload { id, date_vente, client_nom, user_nom, total, mode_paiement, lignes })
}