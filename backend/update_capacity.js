const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tenant_management.db');
const db = new sqlite3.Database(dbPath);

// Update Mmaduabuchi Lodge capacity to 80
db.run(`UPDATE properties SET capacity = 80 WHERE name LIKE '%mmaduabuchi%' OR name LIKE '%Mmaduabuchi%'`, function(err) {
  if (err) {
    console.error('Error updating property capacity:', err.message);
  } else {
    console.log(`✅ Updated ${this.changes} property(ies) with capacity 80`);
  }
});

// Show all properties with their capacities
db.all(`SELECT name, address, capacity FROM properties`, (err, rows) => {
  if (err) {
    console.error('Error fetching properties:', err.message);
  } else {
    console.log('\n📋 Current Properties:');
    rows.forEach(row => {
      console.log(`- ${row.name}: ${row.capacity} apartments`);
    });
  }
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed.');
    }
  });
});