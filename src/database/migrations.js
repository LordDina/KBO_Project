const db = require('./connection');

const migrations = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS activites (
          id_activite TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          version_nace TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table activites:', err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS entreprises (
          id_entreprise TEXT PRIMARY KEY,
          nom_entreprise TEXT NOT NULL,
          id_activite TEXT NOT NULL,
          adresse TEXT,
          code_postal TEXT,
          commune TEXT,
          pays TEXT DEFAULT 'Belgique',
          date_creation DATE,
          statut TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_activite) REFERENCES activites(id_activite)
        )
      `, (err) => {
        if (err) console.error('Erreur création table entreprises:', err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS unites_etablissement (
          id_unite TEXT PRIMARY KEY,
          id_entreprise TEXT NOT NULL,
          numero_unite INTEGER,
          nom_unite TEXT,
          adresse TEXT,
          code_postal TEXT,
          commune TEXT,
          type_unite TEXT,
          statut TEXT DEFAULT 'active',
          date_debut DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_entreprise) REFERENCES entreprises(id_entreprise) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Erreur création table unites_etablissement:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_entreprises_activite ON entreprises(id_activite)', (err) => {
        if (err) console.error('Erreur création index:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_unites_entreprise ON unites_etablissement(id_entreprise)', (err) => {
        if (err) console.error('Erreur création index:', err);
        resolve();
      });
    });
  });
};

migrations().then(() => {
  console.log('✓ Migrations exécutées avec succès');
  process.exit(0);
}).catch((err) => {
  console.error('✗ Erreur lors des migrations:', err);
  process.exit(1);
});

module.exports = migrations;
