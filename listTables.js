const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite');

const tablesToCheck = [
  'sap_changelog_aspect',
  'sap_changelog_ChangeLog',
  'sap_changelog_Changes',
  'inventory_Order',
  'inventory_Product'
];

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Tables in db.sqlite:');
  tables.forEach(table => console.log(table.name));

  // For each table you want to check, print its contents
  tablesToCheck.forEach(tableName => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.error(`Error reading table ${tableName}:`, err.message);
      } else {
        console.log(`\nData in table ${tableName}:`);
        console.table(rows);
      }
    });
  });

  // Wait a bit before closing to ensure all queries finish
  setTimeout(() => db.close(), 1000);
});