# VetPharma (ASPA NGOZI) — Gestion de Pharmacie Vétérinaire

Application desktop moderne conçue pour la gestion complète d'une pharmacie vétérinaire : clients, animaux, ordonnances, stocks, ventes et facturation.

## 📋 Prérequis

Avant de cloner et de lancer le projet, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) et **npm**
- **Rust** (pour le backend Tauri) : [rustup.rs](https://rustup.rs/)
- **Tauri CLI** : `npm install -D @tauri-apps/cli`
- Un éditeur de code (VS Code recommandé)

## 🚀 Installation et lancement (Mode Développement)

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/amosndayikeza-dev/aspa_ngozi.git
   cd aspa_ngozi# VetPharma (ASPA NGOZI) — Gestion de Pharmacie Vétérinaire

Application desktop moderne conçue pour la gestion complète d'une pharmacie vétérinaire : clients, animaux, ordonnances, stocks, ventes et facturation.

## 📋 Prérequis

Avant de cloner et de lancer le projet, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) et **npm**
- **Rust** (pour le backend Tauri) : [rustup.rs](https://rustup.rs/)
- **Tauri CLI** : `npm install -D @tauri-apps/cli`
- Un éditeur de code (VS Code recommandé)

## 🚀 Installation et lancement (Mode Développement)

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/amosndayikeza-dev/aspa_ngozi.git
   cd aspa_ngozi# VetPharma (ASPA NGOZI) — Gestion de Pharmacie Vétérinaire

Application desktop moderne conçue pour la gestion complète d'une pharmacie vétérinaire : clients, animaux, ordonnances, stocks, ventes et facturation.

## 📋 Prérequis

Avant de cloner et de lancer le projet, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) et **npm**
- **Rust** (pour le backend Tauri) : [rustup.rs](https://rustup.rs/)
- **Tauri CLI** : `npm install -D @tauri-apps/cli`
- Un éditeur de code (VS Code recommandé)

## 🚀 Installation et lancement (Mode Développement)

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/amosndayikeza-dev/aspa_ngozi.git
   cd aspa_ngozi

   Installer les dépendances frontend

bash
npm install
Lancer uniquement l'interface (navigateur) — Recommandé pour le design UI

bash
npm run dev
L'application sera accessible sur http://localhost:5173.

Lancer l'application desktop complète (avec le backend Rust)

bash
npm run tauri dev
🏗️ Stack Technique
Couche	Technologie
Frontend	React 18 + TypeScript + Vite
Styling	Tailwind CSS v4 (Design System personnalisé)
Icônes	Lucide React
Routing	React Router DOM v6
Backend / Desktop	Tauri (Rust)
Base de données	SQLite (via Rust)
📁 Structure du Projet (Feature-Based)
Nous suivons une architecture orientée fonctionnalités pour garantir la maintenabilité et la collaboration.

text
src/
├── app/                  # Câblage global (Providers, Routes, Layouts)
├── features/             # ⭐ Cœur métier (un dossier par module)
│   ├── auth/             # Authentification et rôles
│   ├── clients/          # Gestion des clients et animaux
│   ├── dashboard/        # Tableaux de bord par rôle
│   ├── ventes/           # Point de vente et facturation
│   └── ...
├── shared/               # UI Kit, hooks et utilitaires génériques
│   ├── ui/               # Boutons, Inputs, Modales, DataTable...
│   ├── lib/              # Fonctions utilitaires (cn, formatDate...)
│   └── api/              # Pont IPC vers Tauri (tauri.ts)
├── entities/             # Types partagés entre plusieurs features
├── config/               # Constantes et navigation
└── main.tsx              # Point d'entrée React
🎨 Design System
Les couleurs et polices sont centralisées dans src/App.css via la directive @theme de Tailwind v4. Toute modification de la palette se fait uniquement dans ce fichier.

👥 Rôles Utilisateurs
L'application gère 3 rôles avec des accès différenciés :

Pharmacien : Accès total (Dashboard, Stock, Achats, Ventes, Clients, Ordonnances)

Vendeur : Accès limité (Point de Vente, Clients, Ordonnances)

Admin : Gestion des utilisateurs et des paramètres système

🤝 Collaboration (Workflow Git)
Pour contribuer sans conflit :

Créer une branche pour votre fonctionnalité

bash
git checkout -b feature/nom-de-la-fonctionnalite
Faire vos modifications et commits

bash
git add .
git commit -m "feat: description courte de la modification"
Pousser la branche

bash
git push origin feature/nom-de-la-fonctionnalite