const Database = require('better-sqlite3');
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'aldebaran.db');
const db = new Database(dbPath);

// 初期化フラグ
let isInitialized = false;

// テーブル作成
function initializeDatabase() {
  if (isInitialized) return;

  try {
    // users テーブル
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        department TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // proposals テーブル
    db.exec(`
      CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        client_name TEXT NOT NULL,
        website_url TEXT,
        product_type TEXT,
        purpose_goals TEXT,
        target_audience TEXT,
        hero_ingredients TEXT,
        claims TEXT,
        certifications TEXT,
        allergens TEXT,
        sensory TEXT,
        markets TEXT,
        lot_size TEXT,
        budget TEXT,
        lead_time TEXT,
        package_preferences TEXT,
        sustainability TEXT,
        brand_story TEXT,
        contact_info TEXT,
        research_data TEXT,
        proposal_content TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // materials テーブル
    db.exec(`
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        trade_name TEXT NOT NULL,
        inci_name TEXT NOT NULL,
        manufacturer TEXT,
        description TEXT,
        benefits TEXT,
        category TEXT,
        recommended_concentration TEXT,
        cost_level TEXT,
        price TEXT,
        origin TEXT,
        country TEXT,
        sustainability TEXT,
        certifications TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✓ Database tables created successfully');
    isInitialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// データベース初期化を実行
initializeDatabase();

module.exports = db;
