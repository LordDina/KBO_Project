const fs = require('fs');
const path = require('path');
const db = require('./connection');
const csv = require('csv-parser');

const dataDir = path.join(__dirname, '../../data');
const BATCH_SIZE = 500;

const contactMap = {};

const runSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this.changes || 0);
    });
  });
};

const importContacts = async () => {
  console.log('\n📞 IMPORT DES CONTACTS\n');
  console.log('━'.repeat(50));

  const filePath = path.join(dataDir, 'contact.csv');
  if (!fs.existsSync(filePath)) {
    console.log('❌ Fichier contact.csv non trouvé');
    return;
  }

  console.log('📖 Lecture contact.csv...');
  
  await new Promise((resolve, reject) => {
    let count = 0;
    fs.createReadStream(filePath, { encoding: 'latin1' })
      .pipe(csv())
      .on('data', (row) => {
        const id = row.EntityNumber;
        if (id && row.EntityContact === 'ENT') {
          if (!contactMap[id]) {
            contactMap[id] = { email: null, tel: null };
          }
          if (row.ContactType === 'EMAIL' && !contactMap[id].email) {
            contactMap[id].email = row.Value;
          }
          if (row.ContactType === 'TEL' && !contactMap[id].tel) {
            contactMap[id].tel = row.Value;
          }
        }
        count++;
        if (count % 500000 === 0) {
          console.log(`   📊 ${count.toLocaleString()} lignes lues...`);
        }
      })
      .on('end', () => {
        console.log(`   ✅ ${count.toLocaleString()} lignes lues`);
        console.log(`   → ${Object.keys(contactMap).length} entreprises avec contact\n`);
        resolve();
      })
      .on('error', reject);
  });

  console.log('💾 Mise à jour des contacts...');
  
  let updated = 0;
  let processed = 0;
  const entries = Object.entries(contactMap);
  
  for (const [id, contact] of entries) {
    const contactStr = [contact.email, contact.tel].filter(Boolean).join(' | ');
    if (contactStr) {
      try {
        const changes = await runSQL(
          'UPDATE entreprises SET contact = ? WHERE id_entreprise = ? AND (contact IS NULL OR contact = "")',
          [contactStr, id]
        );
        updated += changes;
      } catch (err) {}
    }
    processed++;
    if (processed % 50000 === 0) {
      console.log(`   📊 ${processed.toLocaleString()}/${entries.length.toLocaleString()} traités, ${updated.toLocaleString()} mis à jour...`);
    }
  }

  console.log(`\n✅ ${updated.toLocaleString()} entreprises mises à jour avec leurs contacts`);
  console.log('━'.repeat(50) + '\n');
};

importContacts().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
