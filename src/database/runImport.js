const { importData } = require('./importCSVData_new');

(async () => {
  try {
    await importData();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
})();
