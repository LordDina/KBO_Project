# Application CRUD KBO - Documentation Complète

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Modèle de données](#modèle-de-données)
3. [Architecture](#architecture)
4. [Installation et configuration](#installation-et-configuration)
5. [API REST](#api-rest)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Choix techniques](#choix-techniques)

---

## Vue d'ensemble

Cette application permet de gérer des entreprises belges et leurs unités d'établissement (succursales) en utilisant les données publiques de la Banque-Carrefour des Entreprises (BCE).

### Fonctionnalités principales
- ✓ **Création** d'entreprises avec validation des codes d'activité
- ✓ **Lecture** des informations d'entreprises et leurs succursales associées
- ✓ **Mise à jour** des données principales d'une entreprise
- ✓ **Suppression** en cascade avec effacement automatique des succursales
- ✓ Gestion complète des unités d'établissement (CRUD)
- ✓ API REST bien structurée avec gestion d'erreurs
- ✓ **Pagination** des entreprises (20 par page)
- ✓ **Recherche** en temps réel avec debounce
- ✓ **Contacts** (email/téléphone) importés depuis les données KBO
- ✓ **Compteurs** mis à jour en temps réel après création/suppression
- ✓ **Documentation Swagger** interactive à /api-docs

---

## Modèle de données

### Schema de la base de données

```
┌─────────────────────────────────────────┐
│              ACTIVITES                   │
├─────────────────────────────────────────┤
│ id_activite (PK)      TEXT              │
│ description           TEXT              │
│ version_nace          TEXT              │
│ created_at            DATETIME          │
└────────────┬──────────────────────────┘
             │
             │ FK: id_activite
             │
┌────────────v──────────────────────────┐
│          ENTREPRISES                   │
├──────────────────────────────────────┤
│ id_entreprise (PK)    TEXT            │
│ nom_entreprise        TEXT            │
│ id_activite (FK)      TEXT            │
│ adresse               TEXT            │
│ code_postal           TEXT            │
│ commune               TEXT            │
│ pays                  TEXT            │
│ contact               TEXT            │
│ date_creation         DATE            │
│ statut                TEXT            │
│ created_at            DATETIME        │
│ updated_at            DATETIME        │
└────────────┬──────────────────────────┘
             │
             │ FK: id_entreprise (ON DELETE CASCADE)
             │
┌────────────v──────────────────────────┐
│   UNITES_ETABLISSEMENT (Succursales)  │
├──────────────────────────────────────┤
│ id_unite (PK)         TEXT            │
│ id_entreprise (FK)    TEXT            │
│ numero_unite          INTEGER         │
│ nom_unite             TEXT            │
│ adresse               TEXT            │
│ code_postal           TEXT            │
│ commune               TEXT            │
│ type_unite            TEXT            │
│ statut                TEXT            │
│ date_debut            DATE            │
│ created_at            DATETIME        │
│ updated_at            DATETIME        │
└──────────────────────────────────────┘
```

### Tables détaillées

#### 1. Table `activites`
Stocke les codes d'activité (NACE) valides conformément à la BCE.

| Colonne | Type | Description |
|---------|------|-------------|
| id_activite | TEXT | Code NACE (ex: '62.01') - Clé primaire |
| description | TEXT | Description de l'activité |
| version_nace | TEXT | Version NACE utilisée |

#### 2. Table `entreprises`
Contient les informations principales des entreprises.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id_entreprise | TEXT | PRIMARY KEY | Identifiant unique (ex: '0123.456.789') |
| nom_entreprise | TEXT | NOT NULL | Nom commercial |
| id_activite | TEXT | FOREIGN KEY | Code d'activité principal |
| adresse | TEXT | | Adresse du siège |
| code_postal | TEXT | | Code postal |
| commune | TEXT | | Commune du siège |
| pays | TEXT | DEFAULT 'Belgique' | Pays |
| contact | TEXT | | Email et/ou téléphone |
| date_creation | DATE | | Date de création |
| statut | TEXT | DEFAULT 'active' | active/inactive/liquidée |
| created_at | DATETIME | AUTO | Timestamp de création |
| updated_at | DATETIME | AUTO | Timestamp de modification |

#### 3. Table `unites_etablissement`
Représente les succursales et unités d'établissement d'une entreprise.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id_unite | TEXT | PRIMARY KEY | Identifiant unique |
| id_entreprise | TEXT | FOREIGN KEY | Référence à l'entreprise |
| numero_unite | INTEGER | | Numéro séquentiel |
| nom_unite | TEXT | NOT NULL | Nom de la succursale |
| adresse | TEXT | | Adresse |
| code_postal | TEXT | | Code postal |
| commune | TEXT | | Localité |
| type_unite | TEXT | | siège/succursale/dépôt |
| statut | TEXT | DEFAULT 'active' | État |
| date_debut | DATE | | Date d'ouverture |
| created_at | DATETIME | AUTO | Timestamp |
| updated_at | DATETIME | AUTO | Timestamp |

### Relations et contraintes
- **Clé étrangère** : Chaque entreprise doit avoir un `id_activite` valide
- **Suppression en cascade** : La suppression d'une entreprise efface automatiquement ses unités
- **Index** : Index sur les clés étrangères pour performances optimales

---

## Architecture

### Structure des fichiers
```
KBO_CRUD/
├── src/
│   ├── index.js                    # Point d'entrée principal
│   ├── database/
│   │   ├── connection.js           # Connexion SQLite
│   │   ├── migrations.js           # Création des tables
│   │   └── seed.js                 # Données initiales
│   ├── controllers/
│   │   ├── entrepriseController.js # Logique HTTP entreprises
│   │   └── uniteController.js      # Logique HTTP unités
│   ├── services/
│   │   ├── entrepriseService.js    # Métier entreprises
│   │   └── uniteService.js         # Métier unités
│   └── routes/
│       ├── entreprises.js          # Routes API entreprises
│       └── unites.js               # Routes API unités
├── data/
│   └── kbo.db                      # Base de données SQLite
├── package.json                    # Dépendances npm
├── .env                            # Configuration
└── README.md                       # Ce fichier
```

### Patrons de conception utilisés

#### 1. **MVC (Model-View-Controller)**
- **Controllers** : Gèrent les requêtes HTTP et réponses
- **Services** : Contiennent la logique métier
- **Database** : Accès à la base de données

#### 2. **Service Layer**
Les services encapsulent toute la logique métier, permettant :
- Réutilisabilité
- Testabilité
- Séparation des responsabilités

#### 3. **Repository Pattern**
Les services agissent comme repositories pour accéder aux données

---

## Installation et configuration

### Prérequis
- Node.js >= 14.0
- npm >= 6.0
- Windows PowerShell / CMD

### Étapes d'installation

#### 1. Cloner ou télécharger le projet
```powershell
cd c:\Users\chaou\Downloads\KBO_CRUD
```

#### 2. Installer les dépendances
```powershell
npm install
```

#### 3. Créer la base de données et les tables
```powershell
npm run db:migrate
```

#### 4. Charger les données de test
```powershell
npm run db:seed
```

#### 5. Démarrer l'application
```powershell
# Mode développement (avec hot-reload via nodemon)
npm run dev

# Mode production
npm start
```

L'API sera disponible sur : **http://localhost:3000**

### Configuration

Le fichier `.env` contient :
```env
PORT=3000
NODE_ENV=development
DB_PATH=./data/kbo.db
```

---

## API REST

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /api/health
```

**Réponse (200) :**
```json
{
  "status": "OK",
  "message": "API KBO CRUD est opérationnelle",
  "timestamp": "2025-12-04T10:30:00.000Z"
}
```

### ENTREPRISES

#### 1. Créer une entreprise
```
POST /api/entreprises
```

**Corps (JSON) :**
```json
{
  "id_entreprise": "ENT004",
  "nom_entreprise": "NouvelleSA SPRL",
  "id_activite": "62.02",
  "adresse": "Avenue Innovation 15",
  "code_postal": "3000",
  "commune": "Louvain",
  "pays": "Belgique"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Entreprise créée avec succès",
  "data": {
    "id_entreprise": "ENT004",
    "nom_entreprise": "NouvelleSA SPRL",
    "id_activite": "62.02"
  }
}
```

#### 2. Récupérer toutes les entreprises
```
GET /api/entreprises
```

**Paramètres de requête optionnels :**
- `statut` : 'active' | 'inactive' | 'liquidée'
- `id_activite` : Code NACE (ex: '62.01')

**Exemple :**
```
GET /api/entreprises?statut=active&id_activite=62.01
```

**Réponse (200) :**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id_entreprise": "ENT001",
      "nom_entreprise": "TechBelgium SARL",
      "id_activite": "62.01",
      "activite_description": "Programmation informatique",
      "adresse": "Rue de l'Innovation 10",
      "code_postal": "1000",
      "commune": "Bruxelles",
      "pays": "Belgique",
      "statut": "active",
      "nombre_unites": 2
    }
  ]
}
```

#### 3. Récupérer une entreprise avec ses unités
```
GET /api/entreprises/{id_entreprise}
```

**Exemple :**
```
GET /api/entreprises/ENT001
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id_entreprise": "ENT001",
    "nom_entreprise": "TechBelgium SARL",
    "id_activite": "62.01",
    "activite_description": "Programmation informatique",
    "adresse": "Rue de l'Innovation 10",
    "code_postal": "1000",
    "commune": "Bruxelles",
    "statut": "active",
    "unites_etablissement": [
      {
        "id_unite": "UNIT001",
        "numero_unite": 1,
        "nom_unite": "Siège social Bruxelles",
        "adresse": "Rue de l'Innovation 10",
        "commune": "Bruxelles",
        "type_unite": "siege",
        "statut": "active"
      },
      {
        "id_unite": "UNIT002",
        "numero_unite": 2,
        "nom_unite": "Bureau Liège",
        "adresse": "Rue Centrale 45",
        "commune": "Liège",
        "type_unite": "succursale",
        "statut": "active"
      }
    ]
  }
}
```

#### 4. Mettre à jour une entreprise
```
PUT /api/entreprises/{id_entreprise}
```

**Corps (JSON) - Tous les champs sont optionnels :**
```json
{
  "nom_entreprise": "TechBelgium SA",
  "adresse": "Rue Innovation 20",
  "code_postal": "1050",
  "statut": "active"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Entreprise mise à jour avec succès"
}
```

#### 5. Supprimer une entreprise (et ses unités)
```
DELETE /api/entreprises/{id_entreprise}
```

**Exemple :**
```
DELETE /api/entreprises/ENT001
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Entreprise supprimée avec succès",
  "deletedCount": 1
}
```

### UNITÉS D'ÉTABLISSEMENT

#### 1. Créer une unité pour une entreprise
```
POST /api/entreprises/{id_entreprise}/unites
```

**Corps (JSON) :**
```json
{
  "id_unite": "UNIT005",
  "numero_unite": 3,
  "nom_unite": "Bureau Gand",
  "adresse": "Rue Commerciale 50",
  "code_postal": "9000",
  "commune": "Gand",
  "type_unite": "succursale"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Unité créée avec succès",
  "data": {
    "id_unite": "UNIT005",
    "id_entreprise": "ENT001",
    "nom_unite": "Bureau Gand"
  }
}
```

#### 2. Récupérer toutes les unités d'une entreprise
```
GET /api/entreprises/{id_entreprise}/unites
```

**Réponse (200) :**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id_unite": "UNIT001",
      "id_entreprise": "ENT001",
      "numero_unite": 1,
      "nom_unite": "Siège social",
      "type_unite": "siege",
      "statut": "active"
    }
  ]
}
```

#### 3. Récupérer une unité spécifique
```
GET /api/entreprises/unites/{id_unite}
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id_unite": "UNIT001",
    "id_entreprise": "ENT001",
    "nom_unite": "Siège social Bruxelles"
  }
}
```

#### 4. Mettre à jour une unité
```
PUT /api/entreprises/unites/{id_unite}
```

**Corps (JSON) - Champs optionnels :**
```json
{
  "nom_unite": "Siège principal Bruxelles",
  "adresse": "Rue Innovation 12",
  "statut": "active"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Unité mise à jour avec succès"
}
```

#### 5. Supprimer une unité
```
DELETE /api/entreprises/unites/{id_unite}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Unité supprimée avec succès"
}
```

---

## Exemples d'utilisation

### Avec cURL

#### Créer une entreprise
```bash
curl -X POST http://localhost:3000/api/entreprises \
  -H "Content-Type: application/json" \
  -d '{
    "id_entreprise": "ENT099",
    "nom_entreprise": "StartupXYZ SA",
    "id_activite": "62.01",
    "adresse": "Rue Startup 1",
    "code_postal": "2000",
    "commune": "Anvers"
  }'
```

#### Récupérer une entreprise
```bash
curl http://localhost:3000/api/entreprises/ENT001
```

#### Mettre à jour une entreprise
```bash
curl -X PUT http://localhost:3000/api/entreprises/ENT001 \
  -H "Content-Type: application/json" \
  -d '{"nom_entreprise": "TechBelgium International"}'
```

#### Supprimer une entreprise
```bash
curl -X DELETE http://localhost:3000/api/entreprises/ENT001
```

### Avec Postman/Insomnia

1. Créer une nouvelle collection
2. Importer les endpoints ci-dessus
3. Tester chaque endpoint en modifiant les IDs et données selon vos besoins

### Avec JavaScript/Fetch

```javascript
// Récupérer toutes les entreprises
fetch('http://localhost:3000/api/entreprises')
  .then(res => res.json())
  .then(data => console.log(data));

// Créer une entreprise
fetch('http://localhost:3000/api/entreprises', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_entreprise: 'ENT999',
    nom_entreprise: 'Ma Startup',
    id_activite: '62.01'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Choix techniques

### 1. Framework et dépendances

#### Express.js
- **Raison** : Framework léger et populaire pour les API REST
- **Avantages** : Minimaliste, flexible, grande communauté

#### SQLite3
- **Raison** : Base de données embarquée, idéale pour le prototypage
- **Avantages** : 
  - Pas de serveur à installer
  - Facile à déployer
  - Suffisant pour une application métier moyenne
- **Limitation** : Non recommandé pour des millions de requêtes concurrentes

#### Body-Parser et CORS
- **body-parser** : Parse les corps JSON des requêtes
- **cors** : Permet les requêtes cross-origin (important pour les intégrations futures)

### 2. Architecture

#### Séparation des responsabilités
```
Controllers (HTTP) → Services (Métier) → Database (Données)
```

- **Controllers** : Valident les requêtes et retournent les réponses HTTP
- **Services** : Contiennent toute la logique métier et validation
- **Database** : Gère uniquement les opérations SQL

#### Avantages
✓ Code testable
✓ Maintenance facile
✓ Réutilisabilité des services
✓ Évolutivité

### 3. Gestion des relations

#### Clé étrangère avec DELETE CASCADE
```sql
FOREIGN KEY (id_entreprise) REFERENCES entreprises(id_entreprise) ON DELETE CASCADE
```

**Effet** : La suppression d'une entreprise efface automatiquement toutes ses unités, garantissant l'intégrité des données.

### 4. Sécurité

#### Validation des données
- Vérification de l'existence des références avant insertion
- Validation des champs obligatoires
- Gestion des erreurs appropriée

#### Paramètres liés (Prepared Statements)
```javascript
db.run('DELETE FROM entreprises WHERE id_entreprise = ?', [id], callback);
```
**Protection** : Prévient les injections SQL

### 5. Performance

#### Indexes
```sql
CREATE INDEX idx_entreprises_activite ON entreprises(id_activite);
CREATE INDEX idx_unites_entreprise ON unites_etablissement(id_entreprise);
```

**Effet** : Accélère les jointures et filtres

### 6. Gestion d'erreurs

#### Approche cohérente
Toutes les erreurs retournent un JSON formaté :
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

---

## Migration vers une base de données réelle

Si vous souhaitez migrer vers PostgreSQL ou MySQL :

### Changements minimaux requis

#### 1. Remplacer le driver SQLite3
```javascript
// Avant (SQLite)
const sqlite3 = require('sqlite3');

// Après (PostgreSQL)
const Pool = require('pg').Pool;
const pool = new Pool(/* config */);
```

#### 2. Adapter la syntaxe SQL
- `CURRENT_TIMESTAMP` → Compatible avec PostgreSQL/MySQL
- `PRAGMA foreign_keys = ON` → Supprimer (PostgreSQL active par défaut)
- `AUTO INCREMENT` → `SERIAL` (PostgreSQL) ou `AUTO_INCREMENT` (MySQL)

#### 3. Adapter les callbacks
```javascript
// SQLite callback
db.run(sql, params, function(err) { });

// PostgreSQL promise
const result = await pool.query(sql, params);
```

---

## Chargement des données CSV KBO réelles

### Procédure

#### 1. Télécharger les données depuis BCE
Aller sur : https://kbopub.economie.fgov.be/kbo-open-data/

#### 2. Créer un script d'import
```javascript
// scripts/importCsv.js
const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('data/activites.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Insérer dans la BD
  });
```

#### 3. Exécuter l'import
```powershell
node scripts/importCsv.js
```

---

## Limitations et améliorations futures

### Limitations actuelles
- Pas d'authentification/autorisation
- Pas de pagination sur les listes
- Pas de cache
- Pas de logging détaillé
- Validation basique

### Améliorations suggérées
1. **JWT Authentication** : Sécuriser les endpoints
2. **Pagination** : Limiter les résultats massifs
3. **Filtrage avancé** : Recherche par nom, commune, etc.
4. **Logging** : Winston ou Pino pour tracer les opérations
5. **Tests** : Jest pour la couverture de code
6. **Documentation interactive** : Swagger/OpenAPI
7. **Migration PostgreSQL** : Pour la scalabilité
8. **Cache Redis** : Pour les requêtes fréquentes

---

## Support et ressources

### Documentation externe
- [Express.js Documentation](https://expressjs.com)
- [SQLite3 npm Documentation](https://www.npmjs.com/package/sqlite3)
- [BCE Données Ouvertes](https://kbopub.economie.fgov.be)

### Codes d'activité NACE
- Version complète : https://ec.europa.eu/eurostat/web/nace
- Format BCE : Codes à 2 décimales (ex: 62.01, 47.11)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2025  
**Auteur** : Projet KBO CRUD pour cours
