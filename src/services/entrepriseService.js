const db = require('../database/connection');

class EntrepriseService {
  static getTotalCount() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM entreprises', [], (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.count : 0);
      });
    });
  }

  static createEntreprise(entrepriseData) {
    return new Promise((resolve, reject) => {
      const { id_entreprise, nom_entreprise, id_activite, adresse, code_postal, commune, contact } = entrepriseData;

      db.get(
        'SELECT * FROM activites WHERE id_activite = ?',
        [id_activite],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Activité invalide'));

          const sql = `
            INSERT INTO entreprises 
            (id_entreprise, nom_entreprise, id_activite, adresse, code_postal, commune, contact)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(
            sql,
            [id_entreprise, nom_entreprise, id_activite, adresse, code_postal, commune, contact],
            function(err) {
              if (err) return reject(err);
              resolve({ id_entreprise, nom_entreprise, id_activite });
            }
          );
        }
      );
    });
  }

  static getEntrepriseById(id_entreprise) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT e.*, a.description as activite_description
        FROM entreprises e
        LEFT JOIN activites a ON e.id_activite = a.id_activite
        WHERE e.id_entreprise = ?
      `;

      db.get(sql, [id_entreprise], (err, entreprise) => {
        if (err) return reject(err);
        if (!entreprise) return reject(new Error('Entreprise non trouvée'));

        // Récupérer les unités d'établissement
        db.all(
          'SELECT * FROM unites_etablissement WHERE id_entreprise = ? ORDER BY numero_unite',
          [id_entreprise],
          (err, unites) => {
            if (err) return reject(err);
            resolve({
              ...entreprise,
              unites_etablissement: unites || [],
            });
          }
        );
      });
    });
  }

  static getAllEntreprises(filters = {}) {
    return new Promise((resolve, reject) => {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;

      let countSql = 'SELECT COUNT(*) as total FROM entreprises e WHERE 1=1';
      let sql = `
        SELECT e.*, a.description as activite_description
        FROM entreprises e
        LEFT JOIN activites a ON e.id_activite = a.id_activite
        WHERE 1=1
      `;
      const params = [];
      const countParams = [];

      if (filters.search) {
        const search = filters.search;
        // Recherche au début du nom (utilise l'index) ou correspondance exacte pour ID
        if (/^\d/.test(search)) {
          // Si commence par un chiffre, chercher dans l'ID
          sql += ' AND e.id_entreprise LIKE ?';
          countSql += ' AND e.id_entreprise LIKE ?';
          params.push(`${search}%`);
          countParams.push(`${search}%`);
        } else {
          // Sinon chercher au début du nom (plus rapide avec index)
          sql += ' AND e.nom_entreprise LIKE ?';
          countSql += ' AND e.nom_entreprise LIKE ?';
          params.push(`${search}%`);
          countParams.push(`${search}%`);
        }
      }

      if (filters.statut) {
        sql += ' AND e.statut = ?';
        countSql += ' AND e.statut = ?';
        params.push(filters.statut);
        countParams.push(filters.statut);
      }

      if (filters.id_activite) {
        sql += ' AND e.id_activite = ?';
        countSql += ' AND e.id_activite = ?';
        params.push(filters.id_activite);
        countParams.push(filters.id_activite);
      }

      sql += ' ORDER BY e.nom_entreprise LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.get(countSql, countParams, (err, countRow) => {
        if (err) return reject(err);
        
        const total = countRow ? countRow.total : 0;
        const totalPages = Math.ceil(total / limit);

        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve({
            data: rows || [],
            pagination: {
              page,
              limit,
              total,
              totalPages
            }
          });
        });
      });
    });
  }

  static updateEntreprise(id_entreprise, updateData) {
    return new Promise((resolve, reject) => {
      const { nom_entreprise, id_activite, adresse, code_postal, commune, statut, contact } = updateData;

      // Vérifier que l'entreprise existe
      db.get(
        'SELECT * FROM entreprises WHERE id_entreprise = ?',
        [id_entreprise],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Entreprise non trouvée'));

          // Si l'activité est modifiée, vérifier qu'elle existe
          if (id_activite && id_activite !== row.id_activite) {
            db.get(
              'SELECT * FROM activites WHERE id_activite = ?',
              [id_activite],
              (err, actRow) => {
                if (err) return reject(err);
                if (!actRow) return reject(new Error('Activité invalide'));
                performUpdate();
              }
            );
          } else {
            performUpdate();
          }

          function performUpdate() {
            const updates = [];
            const values = [];

            if (nom_entreprise !== undefined) {
              updates.push('nom_entreprise = ?');
              values.push(nom_entreprise);
            }
            if (id_activite !== undefined) {
              updates.push('id_activite = ?');
              values.push(id_activite);
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
            if (contact !== undefined) {
              updates.push('contact = ?');
              values.push(contact);
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id_entreprise);

            const sql = `UPDATE entreprises SET ${updates.join(', ')} WHERE id_entreprise = ?`;

            db.run(sql, values, function(err) {
              if (err) return reject(err);
              resolve({ message: 'Entreprise mise à jour avec succès' });
            });
          }
        }
      );
    });
  }

  static deleteEntreprise(id_entreprise) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM entreprises WHERE id_entreprise = ?',
        [id_entreprise],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Entreprise non trouvée'));

          // La suppression en cascade est gérée par la contrainte FOREIGN KEY
          db.run(
            'DELETE FROM entreprises WHERE id_entreprise = ?',
            [id_entreprise],
            function(err) {
              if (err) return reject(err);
              resolve({ message: 'Entreprise supprimée avec succès', deletedCount: this.changes });
            }
          );
        }
      );
    });
  }
}

module.exports = EntrepriseService;
