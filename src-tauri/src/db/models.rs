use crate::services::enums::*;

// ================== Veterinaire ===============

#[derive(Debug, Clone)]

pub struct Veterinaire {
    pub id:i32,
    pub nom:String,
    pub numero_ordre:String,
    pub telephone:String,
    pub email:Option<String>,
    pub clinique:Option<String>,
}

//=================== Categorie ==================

#[derive(Debug, Clone)]

pub struct Categorie{
    pub id:i32,
    pub nom:String,
    pub description:String,
}

// =============== Fournisseur ==================

#[derive(Debug, Clone)]

pub struct Fournisseur {
    pub id:i32,
    pub nom:String,
    pub telephone:String,
    pub email:Option<String>,
    pub adresse:String,
    pub condition_paiement:Option<String>,
}

// ======================== Role =======================

#[derive(Debug, Clone)]

pub struct Role{
    pub id:i32,
    pub nom:String,

}

// ================== parametre ===================
#[derive(Debug, Clone)]

pub struct Parametre{
    pub cle:String,
    pub valeur:Option<String>,
    pub description:Option<String>,
}

// ================ Espece ================

#[derive(Debug, Clone)]

pub struct Espece{
    pub id:i32,
    pub nom:String,
}

// ======================= Emplacement =================

#[derive(Debug, Clone)]

pub struct Emplacement{
    pub id:i32,
    pub nom:String,
    pub type_emplacement:TypeEmplacement,
    pub temperature_min:Option<f64>,
    pub temperature_max:Option<f64>,
}

//===================Medicament=================

#[derive(Debug, Clone)]

pub struct Medicament{
    pub id:i32,
    pub code:String,
    pub nom:String,
    pub categorie_id:i32,
    pub forme:Forme,
    pub dosage:Option<String>,
    pub unite:String,
    pub prix_vente:f64,
    pub seuil_alerte:i32,
    pub ordonance_requise:Option<bool>,
    pub image:Option<String>
    
}   

// ================ Utilisateur ==============

#[derive(Debug, Clone)]

pub struct Utilisateur{
    pub id:i32,
    pub nom:String,
    pub email:Option<String>,
    pub mot_de_passe:String,
    pub role_id:i32,
    pub actif:bool,
}

// ============= Client =====================

#[derive(Debug, Clone)]

pub struct Client{
    pub id:i32,
    pub type_client:TypeClient,
    pub nom:String,
    pub telephone:String,
    pub email:Option<String>,
    pub adresse:String,
    pub solde_credit:Option<f64>,
}

// ================ Race ==============

#[derive(Debug, Clone)]

pub struct Race{
    pub id:i32,
    pub espece_id:i32,
    pub nom:String,
}

//====================== Animal ===============

#[derive(Debug, Clone)]

pub struct Animal{
    pub id:i32,
    pub client_id:i32,
    pub nom:String,
    pub espece_id:i32,
    pub race_id:Option<i32>,
    pub sexe:Sexe,
    pub poids:Option<f64>,
    pub date_naissance:Option<String>,
    pub numero_identification:Option<String>
}

// ==================Lot ======================

#[derive(Debug, Clone)]

pub struct Lot{
    pub id:i32,
    pub medicament_id:i32,
    pub fournisseur_id:Option<i32>,
    pub numero_lot:String,
    pub date_fabrication:String,
    pub date_peremption:String,
    pub prix_achat:f64,
    pub quantite_initial:Option<i32>,
    pub emplacement_id:Option<i32>,
}
// ================ Commande ===============

#[derive(Debug, Clone)]

pub struct Commande{
    pub id:i32,
    pub numero:String,
    pub veterinaire_id:Option<i32>,
    pub client_id:i32,
    pub animal_id:Option<i32>,
    pub diagnostic:Option<String>,
    pub note:Option<String>,
}

// ===================== Inventaire ============

#[derive(Debug, Clone)]

pub struct Inventaire{
    pub id:i32,
    pub date:String,
    pub utilisateur_id:Option<i32>,
    pub statut:Option<String>,
}

// ================== Achat ===============

#[derive(Debug, Clone)]

pub struct Achat{
    pub id:i32,
    pub fournisseur_id:i32,
    pub numero_facture:Option<String>,
    pub montant_total:f64,
    pub statut:Option<String>,
    pub utilisateur_id:Option<i32>,
}
//===================== Vente ===============

#[derive(Debug, Clone)]

pub struct Vente{
    pub id:i32,
    pub client_id:i32,
    pub animal_id:Option<i32>,
    pub veterinaire_id:Option<i32>,
    pub commande_id:i32,
    pub montant_total:f64,
    pub recu:String,
    pub statut:Option<String>,
    pub utilisateur_id:i32,
}

//================ Ligne_commande =============

#[derive(Debug, Clone)]

pub struct LigneCommande{
    pub id:i32,
    pub commande_id:i32,
    pub medicament_id:i32,
    pub dosage:Option<String>,
    pub frequence:Option<String>,
    pub duree:Option<String>,
    pub voie_administratif:Option<String>,
    pub quantite:i32,
}
// ================ LigneAchat ================

#[derive(Debug, Clone)]

pub struct LigneAchat{
    pub id:i32,
    pub achat_id:i32,
    pub medicament_id:i32,
    pub lot_id:i32,
    pub quantite:i32,
    pub prix_unitaire:f64,
    pub prix_total:f64,
}

// ================== LigneVente ==============

#[derive(Debug, Clone)]

pub struct LigneVente{
    pub id:i32,
    pub vente_id:i32,
    pub medicament_id:i32,
    pub quantite:i32,
    pub prix_unitaire:f64,
    pub prix_total:f64,
}

//=========== facture ===========

#[derive(Debug, Clone)]

pub struct Facture{
    pub id:i32,
    pub vente_id:i32,
    pub numero_facture:String,
    pub montant_ht:Option<f64>,
    pub tva:Option<f64>,
    pub montant_ttc:Option<f64>,
    pub statut:Option<String>,
    pub echeance:Option<String>,
    pub image_medicament:Option<String>
}

// =================== RetourVente ==============

#[derive(Debug, Clone)]

pub  struct RetourVente{
    pub id:i32,
    pub vente_id:i32,
    pub motif:String,
    pub montant_rembourser:f64,
}

//============= RetourFournisseur ===========

#[derive(Debug, Clone)]

pub struct RetourFournisseur{
    pub id:i32,
    pub achat_id:i32,
    pub motif:String,
    pub montant:f64,
}

// ============================ Mouvement_stock===========================

#[derive(Debug, Clone)]

pub struct MouvementStock{
    pub id:i32,
    pub lot_id:i32,
    pub type_mouvement:String,
    pub quantite:i32,
    pub motif:String,
    pub utilisateur_id:i32,
    pub vente_id:i32,
    pub achat_id:i32,
}


// ==================== Paiement ====================

#[derive(Debug, Clone)]

pub struct Paiement {
    pub id: i32,
    pub facture_id: i32,
    pub date_paiement: Option<String>, 
    pub montant: f64,                  
    pub mode_paiement: ModePaiement,   
    pub reference: Option<String>,     
    pub utilisateur_id: Option<i32>,   
}


// ==================== Audit Log ====================

#[derive(Debug, Clone)]

pub struct AuditLog {
    pub id: i32,
    pub utilisateur_id: Option<i32>,
    pub action: ActionAudit,
    pub table_referencee: Option<String>,
    pub enregistrement_id: Option<i32>,
    pub ancienne_valeur: Option<String>,
    pub nouvelle_valeur: Option<String>,
    pub lieu: Option<String>,
    pub details: Option<String>,
}