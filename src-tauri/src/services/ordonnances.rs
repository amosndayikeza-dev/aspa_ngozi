//! Logique métier des ordonnances.

use crate::error::AppError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneOrdonnancePayload {
    pub medicament_id: String,
    pub nom_medicament: String,
    pub posologie: String,
    pub duree: Option<String>,
    pub quantite: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrdonnancePayload {
    pub id: String,
    pub date: String, 
    pub client_nom: String,
    pub animal_nom: String,
    pub animal_espece: String,
    pub veterinaire_nom: String,
    pub lignes: Vec<LigneOrdonnancePayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LigneOrdonnanceInput {
    pub produit_id: String,
    pub posologie: String,
    pub duree: Option<String>,
    pub quantite: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrdonnanceInput {
    pub animal_id: String,
    pub user_id: String,
    pub notes: Option<String>,
    pub lignes: Vec<LigneOrdonnanceInput>,
}

/// Crée une ordonnance et ses lignes.
pub fn create(conn: &mut Connection, input: OrdonnanceInput) -> Result<(), AppError> {
    let tx = conn.transaction()?;
    let id = format!("ORD-{}", &uuid::Uuid::new_v4().to_string()[..4].to_uppercase());
    let now = chrono::Utc::now().to_rfc3339();
    let date_ordonnance = chrono::Local::now().format("%Y-%m-%d").to_string();

    tx.execute(
        "INSERT INTO ordonnances (id, animal_id, user_id, date_ordonnance, notes, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, input.animal_id, input.user_id, date_ordonnance, input.notes, now],
    )?;

    for ligne in input.lignes {
        let ligne_id = format!("LOR-{}", &uuid::Uuid::new_v4().to_string()[..6].to_uppercase());
        tx.execute(
            "INSERT INTO ordonnances_lignes (id, ordonnance_id, produit_id, posologie, duree, quantite) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ligne_id, id, ligne.produit_id, ligne.posologie, ligne.duree, ligne.quantite],
        )?;
    }

    tx.commit()?;
    Ok(())
}

/// Liste toutes les ordonnances.
pub fn list_all(conn: &Connection) -> Result<Vec<OrdonnancePayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT o.id, o.date_ordonnance, c.nom || ' ' || c.prenom, a.nom, a.espece, u.nom
         FROM ordonnances o
         JOIN animaux a ON a.id = o.animal_id
         JOIN clients c ON c.id = a.client_id
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(OrdonnancePayload {
            id: row.get(0)?,
            date: row.get(1)?,
            client_nom: row.get(2)?,
            animal_nom: row.get(3)?,
            animal_espece: row.get(4)?,
            veterinaire_nom: row.get(5)?,
            lignes: Vec::new(),
        })
    })?;

    let mut ordonnances = Vec::new();
    for row in rows {
        let mut ord = row?;
        
        let mut stmt_lignes = conn.prepare(
            "SELECT ol.produit_id, p.nom, ol.posologie, ol.duree, ol.quantite
             FROM ordonnances_lignes ol
             JOIN produits p ON p.id = ol.produit_id
             WHERE ol.ordonnance_id = ?1"
        )?;
        
        let lignes_rows = stmt_lignes.query_map([&ord.id], |r| {
            Ok(LigneOrdonnancePayload {
                medicament_id: r.get(0)?,
                nom_medicament: r.get(1)?,
                posologie: r.get(2)?,
                duree: r.get(3)?,
                quantite: r.get(4)?,
            })
        })?;

        for l in lignes_rows {
            ord.lignes.push(l?);
        }
        
        ordonnances.push(ord);
    }

    Ok(ordonnances)
}

/// Récupère une ordonnance par son ID.
pub fn get_by_id(conn: &Connection, id: &str) -> Result<OrdonnancePayload, AppError> {
    let result = conn.query_row(
        "SELECT o.id, o.date_ordonnance, c.nom || ' ' || c.prenom, a.nom, a.espece, u.nom
         FROM ordonnances o
         JOIN animaux a ON a.id = o.animal_id
         JOIN clients c ON c.id = a.client_id
         JOIN users u ON u.id = o.user_id
         WHERE o.id = ?1",
        [id],
        |row| {
            Ok(OrdonnancePayload {
                id: row.get(0)?,
                date: row.get(1)?,
                client_nom: row.get(2)?,
                animal_nom: row.get(3)?,
                animal_espece: row.get(4)?,
                veterinaire_nom: row.get(5)?,
                lignes: Vec::new(),
            })
        },
    );

    match result {
        Ok(mut ord) => {
            let mut stmt = conn.prepare(
                "SELECT ol.produit_id, p.nom, ol.posologie, ol.duree, ol.quantite
                 FROM ordonnances_lignes ol JOIN produits p ON p.id = ol.produit_id
                 WHERE ol.ordonnance_id = ?1"
            )?;
            let rows = stmt.query_map([&ord.id], |r| {
                Ok(LigneOrdonnancePayload {
                    medicament_id: r.get(0)?,
                    nom_medicament: r.get(1)?,
                    posologie: r.get(2)?,
                    duree: r.get(3)?,
                    quantite: r.get(4)?,
                })
            })?;
            for l in rows { ord.lignes.push(l?); }
            Ok(ord)
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(AppError::Other("Ordonnance introuvable".to_string())),
        Err(e) => Err(e.into()),
    }
}

/// Liste les ordonnances d'un animal spécifique.
pub fn list_by_animal(conn: &Connection, animal_id: &str) -> Result<Vec<OrdonnancePayload>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT o.id, o.date_ordonnance, c.nom || ' ' || c.prenom, a.nom, a.espece, u.nom
         FROM ordonnances o
         JOIN animaux a ON a.id = o.animal_id
         JOIN clients c ON c.id = a.client_id
         JOIN users u ON u.id = o.user_id
         WHERE o.animal_id = ?1
         ORDER BY o.created_at DESC"
    )?;

    let rows = stmt.query_map([animal_id], |row| {
        Ok(OrdonnancePayload {
            id: row.get(0)?,
            date: row.get(1)?,
            client_nom: row.get(2)?,
            animal_nom: row.get(3)?,
            animal_espece: row.get(4)?,
            veterinaire_nom: row.get(5)?,
            lignes: Vec::new(),
        })
    })?;

    let mut ordonnances = Vec::new();
    for row in rows {
        let mut ord = row?;
        
        let mut stmt_lignes = conn.prepare(
            "SELECT ol.produit_id, p.nom, ol.posologie, ol.duree, ol.quantite
             FROM ordonnances_lignes ol
             JOIN produits p ON p.id = ol.produit_id
             WHERE ol.ordonnance_id = ?1"
        )?;
        
        let lignes_rows = stmt_lignes.query_map([&ord.id], |r| {
            Ok(LigneOrdonnancePayload {
                medicament_id: r.get(0)?,
                nom_medicament: r.get(1)?,
                posologie: r.get(2)?,
                duree: r.get(3)?,
                quantite: r.get(4)?,
            })
        })?;

        for l in lignes_rows {
            ord.lignes.push(l?);
        }
        
        ordonnances.push(ord);
    }

    Ok(ordonnances)
}