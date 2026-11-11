//! Logique métier des ventes (Transactions et vérification de stock).

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneVenteInput {
    pub produit_id: String,
    pub quantite: i64,
    pub prix_unitaire: f64, // Le prix au moment de la vente
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VenteInput {
    pub client_id: String,
    pub animal_id: Option<String>,
    pub user_id: String, // Le vendeur
    pub mode_paiement: String,
    pub lignes: Vec<LigneVenteInput>,
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

/// Crée une vente et DÉCRÉMENTE le stock des produits (Transaction).
pub fn create(conn: &mut Connection, input: VenteInput) -> Result<VentePayload, AppError> {
    // 1. Démarrer la transaction
    let tx = conn.transaction()?;

    let id = format!("V-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    let date_vente = chrono::Local::now().format("%Y-%m-%d %H:%M").to_string();
    
    // Calcul du total
    let total: f64 = input.lignes.iter().map(|l| l.quantite as f64 * l.prix_unitaire).sum();

    // 2. Insérer la vente
    tx.execute(
        "INSERT INTO ventes (id, client_id, animal_id, user_id, total, mode_paiement, date_vente, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, input.client_id, input.animal_id, input.user_id, total, input.mode_paiement, date_vente, now],
    )?;

    // 3. Insérer les lignes et mettre à jour le stock
    for ligne in &input.lignes { // 👈 petit détail : on itère par référence pour ne pas consommer le tableau si on en a besoin après
        let ligne_id = format!("LV-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        let sous_total = ligne.quantite as f64 * ligne.prix_unitaire;

        // Vérifier le stock actuel AVANT de vendre
        let stock_actuel: i64 = tx.query_row(
            "SELECT stock FROM produits WHERE id = ?1",
            [&ligne.produit_id],
            |row| row.get(0),
        ).map_err(|_| AppError::Other(format!("Produit {} introuvable", ligne.produit_id)))?;

        if stock_actuel < ligne.quantite {
            return Err(AppError::Other(format!(
                "Stock insuffisant pour le produit {}. Requis: {}, Disponible: {}", 
                ligne.produit_id, ligne.quantite, stock_actuel
            )));
        }

        // Insérer la ligne de vente
        tx.execute(
            "INSERT INTO ventes_lignes (id, vente_id, produit_id, quantite, prix_unitaire, sous_total) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ligne_id, id, ligne.produit_id, ligne.quantite, ligne.prix_unitaire, sous_total],
        )?;

        // Décrémenter le stock
        tx.execute(
            "UPDATE produits SET stock = stock - ?1 WHERE id = ?2",
            params![ligne.quantite, ligne.produit_id],
        )?;
    }

    // ✅ 4. ENREGISTRER LE LOG D'AUDIT (juste avant le commit)
    let log_details = format!(
        "Vente {} effectuée. Total : {} FBU ({} articles)", 
        id, total, input.lignes.len()
    );
    
    crate::services::audit::create_log(
        &tx, 
        &input.user_id, 
        "CREATE", 
        "Ventes", 
        &log_details
    )?;

    // 5. Valider la transaction (tout est enregistré d'un coup : vente, lignes, stock, audit)
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

/// Liste l'historique des ventes récentes.
pub fn list_history(conn: &Connection) -> Result<Vec<VentePayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, client_id, animal_id, user_id, total, mode_paiement, date_vente 
         FROM ventes ORDER BY created_at DESC LIMIT 50"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(VentePayload {
            id: row.get(0)?, client_id: row.get(1)?, animal_id: row.get(2)?,
            user_id: row.get(3)?, total: row.get(4)?, mode_paiement: row.get(5)?, date_vente: row.get(6)?,
        })
    })?;

    let mut ventes = Vec::new();
    for row in rows { ventes.push(row?); }
    Ok(ventes)
}

/// Détail complet d'une vente (avec ses lignes).
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
    pub quantite: i64,
    pub prix_unitaire: f64,
    pub sous_total: f64,
}

/// Récupère l'historique des ventes d'un vendeur spécifique.
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
    for row in rows { ventes.push(row?); }
    Ok(ventes)
}

/// Récupère le détail complet d'une vente (avec ses lignes).
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
        "SELECT p.nom, vl.quantite, vl.prix_unitaire, vl.sous_total
         FROM ventes_lignes vl
         JOIN produits p ON p.id = vl.produit_id
         WHERE vl.vente_id = ?1"
    )?;
    let rows = stmt.query_map([vente_id], |row| {
        Ok(LigneVenteDetail {
            nom_produit: row.get(0)?, quantite: row.get(1)?,
            prix_unitaire: row.get(2)?, sous_total: row.get(3)?,
        })
    })?;

    let mut lignes = Vec::new();
    for r in rows { lignes.push(r?); }

    Ok(VenteDetailPayload { id, date_vente, client_nom, user_nom, total, mode_paiement, lignes })
}