const fs = require('fs');
const path = require('path');
const db = require('./connection');
const csv = require('csv-parser');

const dataDir = path.join(__dirname, '../../data');
const BATCH_SIZE = 500;

// Maps pour enrichir les données
const denominationMap = {};
const naceDescriptions = {};
const addressMap = {};
const activityMap = {};
const naceCodesSet = new Set();
const importedEnterpriseIds = new Set();

const runSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this.changes || 0);
    });
  });
};

const bulkInsert = async (table, columns, rows) => {
  if (rows.length === 0) return 0;
  
  let totalInserted = 0;
  
  // Insérer par batch de BATCH_SIZE
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    
    const placeholders = batch.map(() => 
      `(${columns.map(() => '?').join(',')})`
    ).join(',');
    
    const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;
    const flatValues = batch.flat();
    
    try {
      const changes = await runSQL(sql, flatValues);
      totalInserted += changes;
    } catch (err) {
      // Fallback: insérer un par un si le batch échoue
      for (const row of batch) {
        try {
          const singleSql = `INSERT OR IGNORE INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
          await runSQL(singleSql, row);
          totalInserted++;
        } catch (e) {
          // Ignorer les erreurs individuelles
        }
      }
    }
  }
  
  return totalInserted;
};

const streamCSV = (filename, onRow) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} non trouvé`);
      return resolve(0);
    }

    console.log(`📖 Lecture ${filename}...`);
    let count = 0;
    
    fs.createReadStream(filePath, { encoding: 'latin1' })
      .pipe(csv())
      .on('data', (row) => {
        onRow(row);
        count++;
        if (count % 500000 === 0) {
          console.log(`   📊 ${count.toLocaleString()} lignes...`);
        }
      })
      .on('end', () => {
        console.log(`   ✅ ${count.toLocaleString()} lignes lues`);
        resolve(count);
      })
      .on('error', (err) => {
        console.error(`❌ Erreur:`, err.message);
        resolve(count);
      });
  });
};

const importCSVWithBatch = (filename, table, columns, mapFn) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} non trouvé`);
      return resolve(0);
    }

    console.log(`📖 Import ${filename} → ${table}...`);
    
    let batch = [];
    let totalInserted = 0;
    let totalRead = 0;
    
    const stream = fs.createReadStream(filePath, { encoding: 'latin1' }).pipe(csv());
    
    const processBatch = async () => {
      if (batch.length === 0) return;
      const toInsert = [...batch];
      batch = [];
      
      const inserted = await bulkInsert(table, columns, toInsert);
      totalInserted += inserted;
    };
    
    stream.on('data', async (row) => {
      const mapped = mapFn(row);
      if (mapped) {
        batch.push(mapped);
        totalRead++;
        
        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          await processBatch();
          
          if (totalRead % 100000 === 0) {
            console.log(`   📊 ${totalRead.toLocaleString()} lus, ${totalInserted.toLocaleString()} insérés...`);
          }
          stream.resume();
        }
      }
    });
    
    stream.on('end', async () => {
      await processBatch(); // Insérer le reste
      console.log(`   ✅ ${totalInserted.toLocaleString()} insérés sur ${totalRead.toLocaleString()} lus`);
      resolve(totalInserted);
    });
    
    stream.on('error', (err) => {
      console.error(`❌ Erreur:`, err.message);
      resolve(totalInserted);
    });
  });
};

const importData = async () => {
  console.log('\n🚀 IMPORT KBO - Méthode BATCH (comme ton ami !)\n');
  console.log('━'.repeat(50));
  
  try {
    // Optimisations SQLite
    await runSQL('PRAGMA foreign_keys = OFF');
    await runSQL('PRAGMA synchronous = OFF');
    await runSQL('PRAGMA journal_mode = MEMORY');
    await runSQL('PRAGMA cache_size = 100000');
    console.log('⚡ Optimisations SQLite activées\n');

    console.log('📚 PHASE 1: Codes NACE');
    await streamCSV('code.csv', (row) => {
      if (row.Category === 'Nace2008' && row.Language === 'FR') {
        naceDescriptions[row.Code] = row.Description;
      }
    });
    console.log(`   → ${Object.keys(naceDescriptions).length} descriptions NACE\n`);

    console.log('📚 PHASE 2: Dénominations');
    await streamCSV('denomination.csv', (row) => {
      const id = row.EntityNumber;
      if (row.TypeOfDenomination === '001') {
        if (row.Language === '1' && !denominationMap[id]) {
          denominationMap[id] = row.Denomination;
        } else if (row.Language === '2' && !denominationMap[id]) {
          denominationMap[id] = row.Denomination;
        }
      }
    });
    console.log(`   → ${Object.keys(denominationMap).length} noms\n`);

    console.log('📚 PHASE 3: Adresses');
    await streamCSV('address.csv', (row) => {
      if (row.EntityNumber && !addressMap[row.EntityNumber]) {
        addressMap[row.EntityNumber] = {
          street: ((row.StreetFR || row.StreetNL || '') + ' ' + (row.HouseNumber || '')).trim(),
          zip: row.Zipcode || '',
          city: row.MunicipalityFR || row.MunicipalityNL || ''
        };
      }
    });
    console.log(`   → ${Object.keys(addressMap).length} adresses\n`);

    console.log('📚 PHASE 4: Activités');
    await streamCSV('activity.csv', (row) => {
      if (row.NaceCode) naceCodesSet.add(row.NaceCode);
      if (row.EntityNumber && row.Classification === 'MAIN' && !activityMap[row.EntityNumber]) {
        activityMap[row.EntityNumber] = row.NaceCode;
      }
    });
    console.log(`   → ${Object.keys(activityMap).length} activités principales`);
    console.log(`   → ${naceCodesSet.size} codes NACE uniques\n`);

    console.log('💾 PHASE 5: Insertion activités...');
    const activityRows = [];
    for (const code of naceCodesSet) {
      activityRows.push([code, naceDescriptions[code] || `Activité ${code}`, '2008']);
    }
    const actCount = await bulkInsert('activites', ['id_activite', 'description', 'version_nace'], activityRows);
    console.log(`   ✅ ${actCount} activités insérées\n`);

    console.log('💾 PHASE 6: Insertion entreprises...');
    const entCount = await importCSVWithBatch(
      'enterprise.csv',
      'entreprises',
      ['id_entreprise', 'nom_entreprise', 'id_activite', 'adresse', 'code_postal', 'commune', 'date_creation', 'statut'],
      (row) => {
        const id = row.EnterpriseNumber;
        const addr = addressMap[id] || { street: '', zip: '', city: '' };
        importedEnterpriseIds.add(id);
        return [
          id,
          denominationMap[id] || id,
          activityMap[id] || '00000',
          addr.street,
          addr.zip,
          addr.city,
          row.StartDate || null,
          row.Status || 'AC'
        ];
      }
    );
    console.log(`   ✅ ${entCount.toLocaleString()} entreprises insérées\n`);

    console.log('💾 PHASE 7: Insertion unités...');
    const unitCount = await importCSVWithBatch(
      'establishment.csv',
      'unites_etablissement',
      ['id_unite', 'id_entreprise', 'numero_unite', 'nom_unite', 'statut', 'date_debut'],
      (row) => {
        if (!importedEnterpriseIds.has(row.EnterpriseNumber)) return null;
        return [
          row.EstablishmentNumber,
          row.EnterpriseNumber,
          row.EstablishmentNumber,
          row.EstablishmentNumber,
          'AC',
          row.StartDate || null
        ];
      }
    );
    console.log(`   ✅ ${unitCount.toLocaleString()} unités insérées\n`);

    await runSQL('PRAGMA synchronous = NORMAL');

    console.log('━'.repeat(50));
    console.log('✨ IMPORT TERMINÉ AVEC SUCCÈS !');
    console.log('━'.repeat(50));
    console.log(`📊 Résumé:`);
    console.log(`   • ${actCount.toLocaleString()} activités`);
    console.log(`   • ${entCount.toLocaleString()} entreprises`);
    console.log(`   • ${unitCount.toLocaleString()} unités`);
    console.log('━'.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

module.exports = { importData };
