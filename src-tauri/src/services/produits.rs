//! Logique métier des produits (CRUD et alertes).
//!
//! Le stock et la date de péremption affichés à l'utilisateur sont maintenant
//! **calculés depuis les lots** (table `lots`) et non plus stockés directement
//! dans la table `produits`. Le champ `produits.stock` sert uniquement de
//! **cache** pour les statistiques rapides (mis à jour par `recalc_stock`).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use crate::services::lots::{self, LotPayload};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProduitPayload {
    pub id: String,
    pub nom: String,
    pub dci: Option<String>,
    pub forme: Option<String>,
    pub categorie: Option<String>,
    pub prix_achat: f64,
    pub prix_vente: f64,
    pub stock: i64,              // Stock total (tous lots)
    pub stock_valide: i64,       // Stock vendable (lots non périmés)
    pub stock_perime: i64,       // Stock à jeter
    pub seuil_alerte: i64,
    pub date_peremption: Option<String>, // Date du prochain lot à périmer (valide)
    pub image_path: Option<String>,
    pub created_at: String,
    pub lots: Vec<LotPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProduitInput {
    pub nom: String,
    pub dci: Option<String>,
    pub forme: Option<String>,
    pub categorie: Option<String>,
    pub prix_achat: f64,
    pub prix_vente: f64,
    pub stock: i64,                  // Ignoré en création/update (calculé depuis lots)
    pub seuil_alerte: i64,
    pub date_peremption: Option<String>, // Idem
    pub image_path: Option<String>,
}

/// Liste tous les produits (avec leurs lots et stocks calculés).
pub fn list(conn: &Connection) -> Result<Vec<ProduitPayload>, AppError> {
    let mut stmt = conn.prepare("SELECT id FROM produits ORDER BY nom ASC")?;
    let ids = stmt.query_map([], |row| row.get::<_, String>(0))?;
    
    let mut produits = Vec::new();
    for id_result in ids {
        let id = id_result?;
        if let Ok(p) = get(conn, &id) {
            produits.push(p);
        }
    }
    Ok(produits)
}

/// Récupère un produit avec tous ses lots et stocks calculés.
pub fn get(conn: &Connection, id: &str) -> Result<ProduitPayload, AppError> {
    let result = conn.query_row(
        "SELECT id, nom, dci, forme, categorie, prix_achat, prix_vente, 
                stock, seuil_alerte, date_peremption, image_path, created_at 
         FROM produits WHERE id = ?1",
        [id],
        |row| {
            Ok((
                row.get::<_, String>(0)?, row.get::<_, String>(1)?,
                row.get::<_, Option<String>>(2)?, row.get::<_, Option<String>>(3)?,
                row.get::<_, Option<String>>(4)?, row.get::<_, f64>(5)?,
                row.get::<_, f64>(6)?, row.get::<_, i64>(7)?, row.get::<_, i64>(8)?,
                row.get::<_, Option<String>>(9)?, row.get::<_, Option<String>>(10)?,
                row.get::<_, String>(11)?,
            ))
        },
    );

    match result {
        Ok((id, nom, dci, forme, categorie, prix_achat, prix_vente, 
             _stock_stored, seuil_alerte, _date_stored, image_path, created_at)) => {
            
            // Charge les lots et calcule les stocks
            let lots_list = lots::list_by_produit(conn, &id)?;
            
            let stock_total: i64 = lots_list.iter().map(|l| l.quantite).sum();
            let stock_valide: i64 = lots_list
                .iter()
                .filter(|l| l.statut == "VALIDE" || l.statut == "EXPIRE_BIENTOT")
                .map(|l| l.quantite)
                .sum();
            let stock_perime: i64 = lots_list
                .iter()
                .filter(|l| l.statut == "PERIME")
                .map(|l| l.quantite)
                .sum();
            
            // Date de péremption = date du prochain lot VALIDE à périmer
            let date_peremption = lots_list
                .iter()
                .filter(|l| l.quantite > 0 && l.jours_restants >= 0)
                .min_by_key(|l| l.jours_restants)
                .map(|l| l.date_peremption.clone());
            
            Ok(ProduitPayload {
                id, nom, dci, forme, categorie, prix_achat, prix_vente,
                stock: stock_total,
                stock_valide,
                stock_perime,
                seuil_alerte,
                date_peremption,
                image_path,
                created_at,
                lots: lots_list,
            })
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Produit introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Crée un nouveau produit (sans lot initial).
/// Si `input.stock > 0`, un lot initial est créé automatiquement.
pub fn create(conn: &Connection, input: ProduitInput) -> Result<ProduitPayload, AppError> {
    let id = format!("P-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();

    // 1. Insérer le produit avec stock = 0 (sera recalculé)
    conn.execute(
        "INSERT INTO produits (id, nom, dci, forme, categorie, prix_achat, prix_vente, stock, seuil_alerte, date_peremption, image_path, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, NULL, ?9, ?10)",
        params![
            id, input.nom, input.dci, input.forme, input.categorie,
            input.prix_achat, input.prix_vente,
            input.seuil_alerte, input.image_path, now
        ],
    )?;

    // 2. Si un stock initial est fourni, créer un lot initial
    if input.stock > 0 {
        let lot_id = format!("LOT-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        let numero_lot = format!("INIT-{}", &id.replace("-", ""));
        let date_perem = input.date_peremption.clone()
            .unwrap_or_else(|| {
                // Date par défaut : aujourd'hui + 1 an
                let d = chrono::Local::now().date_naive() + chrono::Duration::days(365);
                d.format("%Y-%m-%d").to_string()
            });
        
        conn.execute(
            "INSERT INTO lots (id, produit_id, numero_lot, quantite, date_peremption, prix_achat, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![lot_id, id, numero_lot, input.stock, date_perem, input.prix_achat, now],
        )?;
        
        // Mettre à jour le cache stock
        recalc_stock(conn, &id)?;
    }

    get(conn, &id)
}

/// Met à jour un produit existant.
/// **Ne touche ni au stock ni à la date de péremption** (calculés depuis les lots).
pub fn update(conn: &Connection, id: &str, input: ProduitInput) -> Result<ProduitPayload, AppError> {
    let affected = conn.execute(
        "UPDATE produits 
         SET nom = ?1, dci = ?2, forme = ?3, categorie = ?4, 
             prix_achat = ?5, prix_vente = ?6, seuil_alerte = ?7, image_path = ?8
         WHERE id = ?9",
        params![
            input.nom, input.dci, input.forme, input.categorie,
            input.prix_achat, input.prix_vente, input.seuil_alerte,
            input.image_path, id
        ],
    )?;

    if affected == 0 {
        return Err(AppError::Other("Produit introuvable pour la mise à jour".to_string()));
    }

    get(conn, id)
}

/// Supprime un produit (et ses lots via CASCADE).
pub fn delete(conn: &Connection, id: &str) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM produits WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::Other("Produit introuvable pour la suppression".to_string()));
    }
    Ok(())
}

/// Retourne la liste des produits dont le stock **vendable** est sous le seuil.
/// (Exclut les lots périmés : on ne peut pas les vendre, donc ils ne doivent
/// pas empêcher l'alerte de se déclencher.)
pub fn check_alertes_stock(conn: &Connection) -> Result<Vec<ProduitPayload>, AppError> {
    let tous = list(conn)?;
    Ok(tous.into_iter()
        .filter(|p| p.stock_valide <= p.seuil_alerte)
        .collect())
}

/// Recalcule et met à jour le champ `stock` en cache dans la table `produits`
/// à partir de la somme des lots. À appeler après toute modification de lots.
pub fn recalc_stock(conn: &Connection, produit_id: &str) -> Result<(), AppError> {
    let total: i64 = conn.query_row(
        "SELECT COALESCE(SUM(quantite), 0) FROM lots WHERE produit_id = ?1",
        [produit_id],
        |row| row.get(0),
    )?;
    conn.execute(
        "UPDATE produits SET stock = ?1 WHERE id = ?2",
        params![total, produit_id],
    )?;
    Ok(())
}

/// Met à jour le stock global d'un produit à partir de ses lots.
/// Utilisé par l'inventaire : on ajuste un lot spécifique, puis on recalcule.
pub fn ajuster_lot_inventaire(
    conn: &Connection,
    lot_id: &str,
    nouvelle_quantite: i64,
) -> Result<(), AppError> {
    conn.execute(
        "UPDATE lots SET quantite = ?1 WHERE id = ?2",
        params![nouvelle_quantite, lot_id],
    )?;
    
    // Récupérer le produit_id pour recalculer
    let produit_id: String = conn.query_row(
        "SELECT produit_id FROM lots WHERE id = ?1",
        [lot_id],
        |row| row.get(0),
    )?;
    
    recalc_stock(conn, &produit_id)?;
    Ok(())
}