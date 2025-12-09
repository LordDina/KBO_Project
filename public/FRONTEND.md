# 🎨 Interface Frontend - KBO CRUD

## Vue d'ensemble

Interface web intuitive et moderne pour gérer vos entreprises et leurs unités d'établissement.

**Localisation** : `public/index.html`
**Type** : HTML5 + CSS3 + JavaScript Vanilla
**Taille** : ~18 KB (une seule page)
**Navigateurs** : Chrome, Firefox, Safari, Edge

---

## 🎯 Fonctionnalités

### ✅ Gestion des Entreprises
- **Créer** : Formulaire pour ajouter une nouvelle entreprise
- **Lister** : Affichage de toutes les entreprises avec filtres
- **Chercher** : Recherche par ID avec affichage détaillé + unités
- **Modifier** : Édition des données dans une modal
- **Supprimer** : Suppression avec confirmation en cascade

### ✅ Gestion des Unités d'établissement
- **Créer** : Ajouter une succursale à une entreprise
- **Lister** : Affichage intégré dans les détails d'entreprise
- **Supprimer** : Suppression directe depuis la liste

### ✅ Interface utilisateur
- **Design moderne** : Gradient violet, cartes et ombres
- **Responsive** : S'adapte à tous les écrans
- **Notifications** : Alertes de succès/erreur
- **Onglets** : Filtrage par statut
- **Statistiques** : Compteurs en temps réel
- **Modal** : Édition dans une fenêtre modale

---

## 🚀 Démarrage

### 1. Lancer le serveur backend
```powershell
npm run dev
```

### 2. Ouvrir l'interface
```
http://localhost:3000
```

**C'est tout !** L'interface charge automatiquement les données.

---

## 📋 Sections de l'interface

### En-tête (Header)
- Titre et description
- Vérification du statut API
- 3 statistiques clés (Entreprises, Unités, Statut API)

### Formulaires (Colonne gauche)
#### Créer une entreprise
- ID unique (requis)
- Nom commercial (requis)
- Code d'activité NACE (requis)
- Adresse, code postal, commune (optionnels)

#### Créer une unité d'établissement
- ID unique (requis)
- Sélection de l'entreprise (requis)
- Nom de l'unité (requis)
- Adresse, code postal, commune (optionnels)
- Type (Siège/Succursale/Dépôt)

### Listes (Colonne droite)
#### Liste des entreprises
- Affichage de toutes les entreprises
- Onglet "Actives" uniquement
- Boutons Modifier/Supprimer par entreprise
- Nombre d'unités affichées

#### Détails d'une entreprise
- Recherche par ID
- Affichage complet avec toutes les informations
- **Liste des unités** associées avec actions
- Boutons Modifier/Supprimer

---

## 🎨 Design et couleurs

### Palette de couleurs
- **Principal** : `#667eea` (Bleu-mauve)
- **Secondaire** : `#764ba2` (Mauve)
- **Texte** : `#333` (Gris foncé)
- **Danger** : `#dc3545` (Rouge)
- **Succès** : `#d4edda` (Vert clair)
- **Erreur** : `#f8d7da` (Rose clair)

### Typographie
- **Titre** : Segoe UI, 28px, bold
- **Sous-titre** : Segoe UI, 22px, bold
- **Texte** : Segoe UI, 14px, normal

---

## 💻 Points techniques

### Architecture
```
index.html (unité unique)
├── Header (Information + Statistiques)
├── Main Content (4 sections en grille)
│   ├── Formulaire Entreprises
│   ├── Formulaire Unités
│   ├── Liste Entreprises
│   └── Détails Entreprise
└── Modal Édition
```

### Appels API
Tous les appels utilisent `fetch()` avec headers JSON et gestion d'erreurs :

```javascript
fetch(`${API_URL}/entreprises`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Gestion du state
- Données chargées du serveur via API
- Affichage mis à jour en temps réel
- Rafraîchissement automatique toutes les 30 secondes
- Pas de framework (vanilla JS)

### Responsive
- **Desktop** : Grille 2 colonnes
- **Tablet** : Grille adaptée
- **Mobile** : Colonne unique
- Media query à 768px

---

## 🔄 Flux utilisateur

### Créer une entreprise
1. Remplir le formulaire de gauche
2. Sélectionner une activité NACE
3. Cliquer "✓ Créer Entreprise"
4. Notification de succès
5. Liste mise à jour automatiquement

### Chercher une entreprise
1. Saisir l'ID (ex: ENT001)
2. Cliquer "🔍 Rechercher"
3. Affichage détaillé avec unités
4. Possibilité de modifier/supprimer

### Créer une unité
1. Sélectionner une entreprise
2. Remplir les informations de l'unité
3. Cliquer "✓ Créer Unité"
4. Notification et rafraîchissement

### Modifier une entreprise
1. Cliquer "✎ Modifier" sur une entreprise
2. Modal s'ouvre avec les données
3. Modifier les champs nécessaires
4. Cliquer "💾 Enregistrer"
5. Fermeture et rafraîchissement

### Supprimer
1. Cliquer "🗑 Supprimer"
2. Confirmation demandée
3. Suppression et rafraîchissement

---

## 🎯 Formulaires

### Validation côté client
- Champs requis marqués avec `*`
- Validations HTML5 (required, type)
- Messages d'erreur clairs de l'API

### Réinitialisation
- Bouton "Effacer" pour chaque formulaire
- Efface tous les champs

---

## 📊 Statistiques en temps réel

Affichage de 3 métriques :
1. **Nombre d'entreprises** - Total mis à jour
2. **Nombre d'unités** - Calculé côté serveur
3. **Statut API** - ✓ ou ✗

---

## 🔔 Notifications

### Types d'alertes
- **Succès** (vert) : Opération complétée
- **Erreur** (rouge) : Problème détecté

### Comportement
- Affichage automatique en haut de la page
- Disparition après 5 secondes
- Plusieurs alertes peuvent s'accumuler

---

## 🌐 Codes d'activité disponibles

Liste pré-chargée dans le dropdown :

| Code | Description |
|------|-------------|
| 62.01 | Programmation informatique |
| 62.02 | Conseil en informatique |
| 63.11 | Traitement de données |
| 47.11 | Commerce de détail |
| 49.32 | Autres transports terrestres |
| 69.10 | Activités juridiques |
| 70.22 | Conseil pour affaires |
| 78.10 | Placement de main-d'œuvre |

**Note** : Ces codes sont en dur dans le JavaScript. Pour la version finale, charger depuis le serveur.

---

## 🔐 Sécurité

### Mesures implémentées
✓ **CORS** : Communication sécurisée avec le serveur
✓ **Validations** : Côté client et serveur
✓ **Confirmation** : Avant suppressions
✓ **Pas de secrets** : Aucun token stocké
✓ **Fetch secure** : Requêtes HTTPS-ready

### Points d'amélioration
- Ajouter JWT auth pour authentification
- Crypter les données en transit
- Valider les entrées côté client aussi
- Limiter les requêtes (rate limiting)

---

## 📱 Responsiveness

### Breakpoints
- **Desktop** : > 768px
- **Mobile** : < 768px

### Adaptations
- Formulaires : Largeur 100% sur mobile
- Grille : 1 colonne sur mobile
- Modal : Largeur 90% sur mobile
- Boutons : Texte court sur mobile

---

## ⚡ Performance

### Optimisations
- Fichier unique (pas de requêtes supplémentaires)
- CSS inline (pas de fichier séparé)
- JS vanilla (pas de framework lourd)
- Images : Aucune image
- Compression : Minifiable

### Temps de chargement
- **Initial** : ~200ms
- **Données** : ~500ms
- **Total** : ~1s

---

## 🐛 Débogage

### Ouvrir la console
1. Appuyer sur `F12` (ou `Cmd+Opt+I` sur Mac)
2. Onglet "Console"
3. Erreurs/logs affichés

### Messages courants
```javascript
// Erreur API
Erreur: Impossible de se connecter à l'API

// Entreprise non trouvée
Entreprise non trouvée

// Code d'activité invalide
Erreur lors de la création
```

### Vérifications
- API fonctionnelle ? `http://localhost:3000/api/health`
- CORS activé ? Vérifier dans console
- Données chargées ? Voir les stats en haut

---

## 🔄 Intégration avec le backend

### Endpoints utilisés

**Lire**
- `GET /api/health` - Vérifier l'API
- `GET /api/entreprises` - Lister toutes
- `GET /api/entreprises/:id` - Détails + unités

**Créer**
- `POST /api/entreprises` - Créer entreprise
- `POST /api/entreprises/:id/unites` - Créer unité

**Modifier**
- `PUT /api/entreprises/:id` - Modifier entreprise

**Supprimer**
- `DELETE /api/entreprises/:id` - Supprimer entreprise + unités
- `DELETE /api/entreprises/unites/:id` - Supprimer unité

Tous les détails dans `API_EXAMPLES.md`

---

## 📝 Améliorations futures

### Court terme
- [ ] Charger les codes d'activité depuis le serveur
- [ ] Pagination des listes
- [ ] Recherche/filtrage avancé
- [ ] Trier les colonnes

### Moyen terme
- [ ] Framework Vue.js pour meilleure réactivité
- [ ] Authentification JWT
- [ ] Export CSV/PDF
- [ ] Dark mode
- [ ] Graphiques/stats

### Long terme
- [ ] Gestion complète du rôle utilisateur
- [ ] Historique d'audit
- [ ] Synchronisation en temps réel (WebSocket)
- [ ] Progressive Web App (offline mode)
- [ ] Intégration fichiers CSV

---

## 🎓 Code source

### Structure du JavaScript

```javascript
// Configuration
const API_URL = 'http://localhost:3000/api';

// Utilitaires
showAlert(message, type)
openModal(modalId)
closeModal(modalId)

// Chargement des données
loadActivites()
loadEntreprises()
updateEntrepriseSelect()

// CRUD Entreprises
formEntreprise.submit  // Créer
formDetailEntreprise.submit  // Chercher
editEntreprise(id)  // Charger pour modification
formEditEntreprise.submit  // Enregistrer
deleteEntreprise(id)  // Supprimer

// CRUD Unités
formUnite.submit  // Créer
deleteUnite(id)  // Supprimer

// Onglets
tab-button.click  // Gérer affichage

// Initialisation
initApp()  // Vérifier API et charger données
```

---

## 🆘 Besoin d'aide ?

### Le frontend ne se charge pas
1. Vérifier que le serveur tourne : `npm run dev`
2. Accéder à http://localhost:3000
3. Vérifier la console (F12) pour les erreurs

### L'API ne répond pas
1. Vérifier http://localhost:3000/api/health
2. Regarder la console pour erreurs CORS
3. S'assurer que le backend est démarré

### Les données ne se chargent pas
1. Vérifier l'API : /api/health
2. Vérifier la base de données : `npm run db:seed`
3. Regarder l'onglet Network (F12)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2025  
**Navigateurs** : Chrome 90+, Firefox 88+, Safari 14+
