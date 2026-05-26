const db = require('../db');
const fs = require('fs');
const path = require('path');

function initDatabase() {
  try {
    console.log('🗄️ Database başlatılıyor...');

    const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    
    // SQL'i çalıştır (satır satır)
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        db.run(statement, (err) => {
          if (err) console.error('SQL Error:', err.message);
        });
      }
    }

    console.log('✓ Database şeması oluşturuldu');
    console.log('✓ Database dosyası: ./mu_lab.db');
    
    setTimeout(() => process.exit(0), 1000);

  } catch (err) {
    console.error('❌ Database init hatası:', err);
    process.exit(1);
  }
}

initDatabase();