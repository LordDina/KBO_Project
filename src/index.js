require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/connection');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const entrepriseRoutes = require('./routes/entreprises');
const uniteRoutes = require('./routes/unites');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'KBO CRUD API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Routes
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/entreprises', uniteRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API KBO CRUD est opérationnelle',
    timestamp: new Date().toISOString(),
  });
});

// Route des statistiques
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as entreprises FROM entreprises', [], (err, row1) => {
    db.get('SELECT COUNT(*) as unites FROM unites_etablissement', [], (err2, row2) => {
      res.json({
        entreprises: row1 ? row1.entreprises : 0,
        unites: row2 ? row2.unites : 0
      });
    });
  });
});

// Route pour récupérer toutes les activités (codes NACE)
app.get('/api/activites', (req, res) => {
  db.all('SELECT * FROM activites ORDER BY id_activite LIMIT 500', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// Route pour récupérer les entreprises pour le dropdown (limité)
app.get('/api/entreprises-dropdown', (req, res) => {
  db.all('SELECT id_entreprise, nom_entreprise FROM entreprises ORDER BY nom_entreprise LIMIT 200', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// Servir index.html pour la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\n✓ Serveur KBO CRUD démarré sur http://localhost:${PORT}`);
  console.log(`✓ API santé: http://localhost:${PORT}/api/health`);
  console.log(`✓ Environnement: ${process.env.NODE_ENV || 'development'}\n`);
});

// Fermeture gracieuse
process.on('SIGINT', () => {
  console.log('\n✓ Arrêt du serveur...');
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base de données:', err);
    }
    process.exit(0);
  });
});

module.exports = app;
