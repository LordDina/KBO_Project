# Documentation KBO CRUD

## Application de gestion des entreprises belges (BCE/KBO)

---

## Table des matières
1. [Introduction](#1-introduction)
2. [Choix techniques](#2-choix-techniques)
3. [Modèle de données](#3-modèle-de-données)
4. [Opérations CRUD](#4-opérations-crud)
5. [Installation et utilisation](#5-installation-et-utilisation)
6. [Documentation API (Swagger)](#6-documentation-api-swagger)

---

## 1. Introduction

Cette application permet de gérer les données des entreprises belges provenant de la Banque-Carrefour des Entreprises (BCE/KBO). Elle offre une interface web et une API REST pour effectuer des opérations CRUD (Create, Read, Update, Delete) sur les entreprises et leurs unités d'établissement.

### Fonctionnalités principales
- Import des données CSV officielles de la KBO
- Affichage des entreprises avec recherche et filtrage
- Gestion des unités d'établissement (succursales)
- API REST documentée avec Swagger
- Interface web responsive

---

## 2. Choix techniques

### 2.1 Stack technologique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Backend** | Node.js + Express.js | Framework léger et performant pour les API REST |
| **Base de données** | SQLite3 | Base de données embarquée, aucune installation requise |
| **Frontend** | HTML/CSS/JavaScript | Interface simple sans framework pour faciliter la compréhension |
| **Documentation API** | Swagger (OpenAPI 3.0) | Standard industriel pour documenter les API REST |
| **Import CSV** | csv-parser | Streaming pour gérer les gros fichiers (>1GB) |

### 2.2 Architecture de l'application

```
KBO_CRUD/
├── src/
│   ├── index.js              # Point d'entrée, configuration Express
│   ├── swagger.js            # Configuration Swagger/OpenAPI
│   ├── controllers/          # Logique métier
│   │   ├── entrepriseController.js
│   │   └── uniteController.js
│   ├── routes/               # Définition des endpoints API
│   │   ├── entreprises.js
│   │   └── unites.js
│   └── database/
│       ├── connection.js     # Connexion SQLite
│       ├── migrations.js     # Création des tables
│       └── importCSVData.js  # Import des données KBO
├── public/                   # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/                     # Fichiers CSV de la KBO
└── kbo.db                    # Base de données SQLite
```

### 2.3 Justification des choix

**Pourquoi Node.js + Express ?**
- Exécution JavaScript côté serveur
- Grand écosystème de packages (npm)
- Excellente gestion des I/O asynchrones
- Idéal pour les API REST

**Pourquoi SQLite ?**
- Aucune installation de serveur de base de données
- Fichier unique portable (`kbo.db`)
- Compatible SQL standard
- Performances suffisantes pour ce projet

**Pourquoi Swagger ?**
- Documentation interactive de l'API
- Interface de test intégrée
- Standard OpenAPI reconnu

---

## 3. Modèle de données

### 3.1 Schéma relationnel

```
┌─────────────────────┐
│     activites       │
├─────────────────────┤
│ id_activite (PK)    │ ◄──────┐
│ description         │        │
│ version_nace        │        │
│ created_at          │        │
└─────────────────────┘        │
                               │
┌─────────────────────┐        │        ┌─────────────────────────┐
│    entreprises      │        │        │  unites_etablissement   │
├─────────────────────┤        │        ├─────────────────────────┤
│ id_entreprise (PK)  │ ◄──────┼────────│ id_unite (PK)           │
│ nom_entreprise      │        │        │ id_entreprise (FK)      │
│ id_activite (FK)    │ ───────┘        │ numero_unite            │
│ adresse             │                 │ nom_unite               │
│ code_postal         │                 │ adresse                 │
│ commune             │                 │ code_postal             │
│ pays                │                 │ commune                 │
│ date_creation       │                 │ type_unite              │
│ statut              │                 │ statut                  │
│ created_at          │                 │ date_debut              │
│ updated_at          │                 │ created_at              │
└─────────────────────┘                 │ updated_at              │
                                        └─────────────────────────┘
```

### 3.2 Description des tables

#### Table `activites`
Contient les codes NACE (Nomenclature des Activités Économiques de la Communauté Européenne).

| Colonne | Type | Description |
|---------|------|-------------|
| `id_activite` | TEXT (PK) | Code NACE (ex: "62010") |
| `description` | TEXT | Description de l'activité |
| `version_nace` | TEXT | Version du code NACE (2008) |
| `created_at` | DATETIME | Date de création |

#### Table `entreprises`
Table principale contenant les entreprises belges.

| Colonne | Type | Description |
|---------|------|-------------|
| `id_entreprise` | TEXT (PK) | Numéro BCE (ex: "0200.065.765") |
| `nom_entreprise` | TEXT | Dénomination officielle |
| `id_activite` | TEXT (FK) | Code NACE de l'activité principale |
| `adresse` | TEXT | Adresse du siège social |
| `code_postal` | TEXT | Code postal |
| `commune` | TEXT | Commune |
| `pays` | TEXT | Pays (défaut: Belgique) |
| `date_creation` | DATE | Date de création de l'entreprise |
| `statut` | TEXT | Statut (AC = Active, ST = Stopped) |
| `created_at` | DATETIME | Date d'insertion |
| `updated_at` | DATETIME | Date de dernière modification |

#### Table `unites_etablissement`
Contient les unités d'établissement (succursales, filiales).

| Colonne | Type | Description |
|---------|------|-------------|
| `id_unite` | TEXT (PK) | Numéro d'unité (ex: "2.200.065.765") |
| `id_entreprise` | TEXT (FK) | Référence vers l'entreprise |
| `numero_unite` | INTEGER | Numéro séquentiel |
| `nom_unite` | TEXT | Nom de l'unité |
| `adresse` | TEXT | Adresse de l'unité |
| `code_postal` | TEXT | Code postal |
| `commune` | TEXT | Commune |
| `type_unite` | TEXT | Type d'établissement |
| `statut` | TEXT | Statut |
| `date_debut` | DATE | Date de début d'activité |

### 3.3 Contraintes et relations

- **Clé primaire** : Chaque table a une clé primaire unique
- **Clé étrangère** : `entreprises.id_activite` → `activites.id_activite`
- **Clé étrangère** : `unites_etablissement.id_entreprise` → `entreprises.id_entreprise`
- **Cascade** : Suppression d'une entreprise → suppression de ses unités (`ON DELETE CASCADE`)

---

## 4. Opérations CRUD

### 4.1 Entreprises

#### CREATE - Créer une entreprise
```http
POST /api/entreprises
Content-Type: application/json

{
  "id_entreprise": "0999.999.999",
  "nom_entreprise": "Ma Nouvelle Entreprise",
  "id_activite": "62010",
  "adresse": "Rue de la Loi 1",
  "code_postal": "1000",
  "commune": "Bruxelles"
}
```

#### READ - Lire les entreprises
```http
# Toutes les entreprises (avec pagination)
GET /api/entreprises

# Une entreprise spécifique
GET /api/entreprises/0200.065.765

# Recherche par nom
GET /api/entreprises?search=proximus
```

#### UPDATE - Modifier une entreprise
```http
PUT /api/entreprises/0999.999.999
Content-Type: application/json

{
  "nom_entreprise": "Nom Modifié",
  "adresse": "Nouvelle Adresse 123"
}
```

#### DELETE - Supprimer une entreprise
```http
DELETE /api/entreprises/0999.999.999
```

### 4.2 Unités d'établissement

#### CREATE - Créer une unité
```http
POST /api/unites
Content-Type: application/json

{
  "id_unite": "2.999.999.999",
  "id_entreprise": "0999.999.999",
  "nom_unite": "Succursale Liège",
  "adresse": "Place Saint-Lambert 1",
  "code_postal": "4000",
  "commune": "Liège"
}
```

#### READ - Lire les unités
```http
# Toutes les unités d'une entreprise
GET /api/entreprises/0200.065.765/unites

# Une unité spécifique
GET /api/unites/2.200.065.765
```

#### UPDATE - Modifier une unité
```http
PUT /api/unites/2.999.999.999
Content-Type: application/json

{
  "nom_unite": "Succursale Liège Centre",
  "adresse": "Rue Léopold 50"
}
```

#### DELETE - Supprimer une unité
```http
DELETE /api/unites/2.999.999.999
```

### 4.3 Codes de réponse HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## 5. Installation et utilisation

### 5.1 Prérequis
- Node.js v18 ou supérieur
- npm (inclus avec Node.js)

### 5.2 Installation

```bash
# Cloner le projet
cd KBO_CRUD

# Installer les dépendances
npm install

# Créer les tables de la base de données
npm run db:migrate

# Importer les données CSV (optionnel)
npm run db:import
```

### 5.3 Lancement

```bash
# Démarrer le serveur
npm start

# Ou en mode développement (avec rechargement automatique)
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 5.4 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre le serveur |
| `npm run dev` | Mode développement avec nodemon |
| `npm run db:migrate` | Crée les tables SQL |
| `npm run db:import` | Importe les données CSV |

---

## 6. Documentation API (Swagger)

L'API est documentée avec Swagger/OpenAPI. Une interface interactive est disponible à :

**http://localhost:3000/api-docs**

Cette interface permet de :
- Visualiser tous les endpoints disponibles
- Tester les requêtes directement dans le navigateur
- Voir les schémas de données
- Consulter les codes de réponse

### Capture d'écran de l'interface

L'interface Swagger affiche :
- **Entreprises** : GET, POST, PUT, DELETE sur `/api/entreprises`
- **Unités** : GET, POST, PUT, DELETE sur `/api/unites`

---

## Auteur

Projet réalisé dans le cadre du cours de développement d'applications.

## Licence

ISC
