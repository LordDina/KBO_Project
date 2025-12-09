const db = require('../database/connection');

class UniteService {
  static getTotalCount() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM unites_etablissement', [], (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.count : 0);
      });
    });
  }

  static createUnite(uniteData) {
    return new Promise((resolve, reject) => {
      const { id_unite, id_entreprise, numero_unite, nom_unite, adresse, code_postal, commune, type_unite } = uniteData;

      // Vérifier que l'entreprise existe
      db.get(
        'SELECT * FROM entreprises WHERE id_entreprise = ?',
        [id_entreprise],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Entreprise non trouvée'));

          const sql = `
            INSERT INTO unites_etablissement 
            (id_unite, id_entreprise, numero_unite, nom_unite, adresse, code_postal, commune, type_unite)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(
            sql,
            [id_unite, id_entreprise, numero_unite, nom_unite, adresse, code_postal, commune, type_unite],
            function(err) {
              if (err) return reject(err);
              resolve({ id_unite, id_entreprise, nom_unite });
            }
          );
        }
      );
    });
  }

  static getUniteById(id_unite) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM unites_etablissement WHERE id_unite = ?';

      db.get(sql, [id_unite], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Unité d\'établissement non trouvée'));
        resolve(row);
      });
    });
  }

  static getUnitesByEntreprise(id_entreprise) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM unites_etablissement 
        WHERE id_entreprise = ? 
        ORDER BY numero_unite
      `;

      db.all(sql, [id_entreprise], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  static updateUnite(id_unite, updateData) {
    return new Promise((resolve, reject) => {
      const { nom_unite, adresse, code_postal, commune, statut } = updateData;

      // Vérifier que l'unité existe
      db.get(
        'SELECT * FROM unites_etablissement WHERE id_unite = ?',
        [id_unite],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Unité d\'établissement non trouvée'));

          const updates = [];
          const values = [];

          if (nom_unite !== undefined) {
            updates.push('nom_unite = ?');
            values.push(nom_unite);
          }
          if (adresse !== undefined) {
            updates.push('adresse = ?');
            values.push(adresse);
          }
          if (code_postal !== undefined) {
            updates.push('code_postal = ?');
            values.push(code_postal);
          }
          if (commune !== undefined) {
            updates.push('commune = ?');
            values.push(commune);
          }
          if (statut !== undefined) {
            updates.push('statut = ?');
            values.push(statut);
          }

          updates.push('updated_at = CURRENT_TIMESTAMP');
          values.push(id_unite);

          const sql = `UPDATE unites_etablissement SET ${updates.join(', ')} WHERE id_unite = ?`;

          db.run(sql, values, function(err) {
            if (err) return reject(err);
            resolve({ message: 'Unité mise à jour avec succès' });
          });
        }
      );
    });
  }

  static deleteUnite(id_unite) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM unites_etablissement WHERE id_unite = ?',
        [id_unite],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Unité d\'établissement non trouvée'));

          db.run(
            'DELETE FROM unites_etablissement WHERE id_unite = ?',
            [id_unite],
            function(err) {
              if (err) return reject(err);
              resolve({ message: 'Unité supprimée avec succès', deletedCount: this.changes });
            }
          );
        }
      );
    });
  }
}

module.exports = UniteService;
