//! Logique d'exportation CSV.

use crate::error::AppError;
use rusqlite::Connection;

pub fn export_ventes_csv(conn: &Connection, path: &str) -> Result<(), AppError> {
    let mut stmt = conn.prepare(
        "SELECT v.id, v.date_vente, c.nom, c.prenom, u.nom, v.total, v.mode_paiement 
         FROM ventes v
         JOIN clients c ON c.id = v.client_id
         JOIN users u ON u.id = v.user_id
         ORDER BY v.date_vente DESC"
    )?;

    let mut wtr = csv::Writer::from_path(path)
        .map_err(|e| AppError::Other(format!("Impossible de créer le fichier : {}", e)))?;
    
    wtr.write_record(&["ID", "Date", "Client Nom", "Client Prenom", "Vendeur", "Total", "Paiement"])
        .map_err(|e| AppError::Other(e.to_string()))?;

    let rows = stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?,
            row.get::<_, String>(3)?, row.get::<_, String>(4)?, row.get::<_, f64>(5)?, row.get::<_, String>(6)?,
        ))
    })?;

    for row in rows {
        let (id, date, nom, prenom, vendeur, total, paiement) = row?;
        wtr.write_record(&[&id, &date, &nom, &prenom, &vendeur, &total.to_string(), &paiement])
            .map_err(|e| AppError::Other(e.to_string()))?;
    }

    wtr.flush().map_err(|e| AppError::Other(e.to_string()))?;
    Ok(())
}