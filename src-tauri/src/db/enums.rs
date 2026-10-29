// ======= Emplacement ==========

#[derive(Debug, Clone, PartialEq)]
pub enum TypeEmplacement{
    Rayon,
    ChambreFroide, 
}

// ============== Medicament ==========

#[derive(Debug, Clone, PartialEq)]

pub enum Forme{
    Comprime,
    Sirop,
    Injectable,
}

#[derive(Debug, Clone, PartialEq)]

pub enum TypeClient{
    Particulier,
    Docteur,
}

// ================ Animal=================

#[derive(Debug, Clone, PartialEq)]

pub enum Sexe{
    M, F,
}
//================= paiement==================
#[derive(Debug, Clone, PartialEq)]

pub enum ModePaiement {
    Espece,
    MobileMoney,
    Carte,
}
//======================audit_log====================
#[derive(Debug, Clone, PartialEq)]
pub enum ActionAudit {
    Insert,
    Update,
    Delete,
    Login,
    Logout,
    Consultation,
}