









const { Pool } = require('pg');
require('dotenv').config();

let db;

// Use PostgreSQL if configured, otherwise fallback to SQLite for local development
if (process.env.DATABASE_URL) {
  // Production: Connect to PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  db = {
    query: (text, params) => pool.query(text, params),
    exec: async (sql) => {
      try {
        await pool.query(sql);
      } catch (err) {
        if (!err.message.includes('already exists')) throw err;
      }
    },
    close: () => pool.end(),
  };
} else {
  // Development: Use SQLite
  const sqlite3 = require('better-sqlite3');
  const path = require('path');

  const dbPath = path.join(__dirname, 'curio_critters.db');
  db = new sqlite3(dbPath);
}

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    grade TEXT,
    progress TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS learning_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL, -- e.g., 'history', 'language', 'science'
    topic TEXT NOT NULL,   -- specific topic within the subject
    average_score REAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS pet_care_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS quest_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quest_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    score REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS critters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'fluffy_cat', 'unicorn_panda'
    happiness INTEGER DEFAULT 50,
    energy INTEGER DEFAULT 70,
    magic INTEGER DEFAULT 90,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    gear JSON DEFAULT '{}',
    skills JSON DEFAULT '[]',
    merged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS critter_eggs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    egg_type TEXT NOT NULL, -- e.g., 'common', 'rare'
    hatch_timestamp TIMESTAMP, -- Will be set programmatically in application code
    hatched BOOLEAN DEFAULT FALSE,
    critter_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (critter_id) REFERENCES critters(id)
  )
`);

// Helper functions
function getUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

function createUser(username, grade) {
  const stmt = db.prepare('INSERT INTO users (username, grade) VALUES (?, ?)');
  const info = stmt.run(username, grade || 'K-12');
  return getUserById(info.lastInsertRowid);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

function updateUserProgress(userId, progress) {
  const stmt = db.prepare('UPDATE users SET progress = ? WHERE id = ?');
  stmt.run(JSON.stringify(progress), userId);
}

function logLearningMetric(userId, subject, topic, averageScore) {
  // Check if metric already exists for this user/subject/topic
  const existingStmt = db.prepare('SELECT * FROM learning_metrics WHERE user_id = ? AND subject = ? AND topic = ?');
  const existing = existingStmt.get(userId, subject, topic);

  if (existing) {
    // Update existing record with new average score
    const updateStmt = db.prepare('UPDATE learning_metrics SET average_score = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?');
    updateStmt.run(averageScore, existing.id);
  } else {
    // Insert new record
    const insertStmt = db.prepare('INSERT INTO learning_metrics (user_id, subject, topic, average_score) VALUES (?, ?, ?, ?)');
    insertStmt.run(userId, subject, topic, averageScore);
  }
}

function getLearningMetricsForUser(userId) {
  const stmt = db.prepare(`
    SELECT subject, topic, average_score
    FROM learning_metrics
    WHERE user_id = ?
    ORDER BY timestamp DESC
  `);
  return stmt.all(userId);
}

// Critter functions
function addCritter(userId, name, type) {
  const stmt = db.prepare('INSERT INTO critters (user_id, name, type) VALUES (?, ?, ?)');
  const info = stmt.run(userId, name, type);
  return getCritterById(info.lastInsertRowid);
}

function getCritterById(id) {
  const stmt = db.prepare('SELECT * FROM critters WHERE id = ?');
  return stmt.get(id);
}

function updateCritterStats(critterId, stats) {
  const stmt = db.prepare(`
    UPDATE critters
    SET happiness = COALESCE(?[1], happiness),
        energy = COALESCE(?[2], energy),
        magic = COALESCE(?[3], magic),
        level = COALESCE(?[4], level),
        xp = COALESCE(?[5], xp)
    WHERE id = ?
  `);
  stmt.run(stats.happiness, stats.energy, stats.magic, stats.level, stats.xp, critterId);

  return getCritterById(critterId);
}

function getCrittersForUser(userId) {
  const stmt = db.prepare('SELECT * FROM critters WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
}

// Egg helper functions
function addEgg(userId, eggType) {
  const stmt = db.prepare('INSERT INTO critter_eggs (user_id, egg_type, hatch_timestamp) VALUES (?, ?, ?)');
  const info = stmt.run(userId, eggType);
  return getEggById(info.lastInsertRowid);
}

function getEggById(id) {
  const stmt = db.prepare('SELECT * FROM critter_eggs WHERE id = ?');
  return stmt.get(id);
}

function hatchEgg(eggId, critterId) {
  // Update the egg to mark it as hatched and link to the new critter
  const stmt1 = db.prepare('UPDATE critter_eggs SET hatched = TRUE, critter_id = ? WHERE id = ?');
  stmt1.run(critterId, eggId);

  return getEggById(eggId);
}

function getUnhatchedEggsForUser(userId) {
  const stmt = db.prepare('SELECT * FROM critter_eggs WHERE user_id = ? AND hatched = FALSE ORDER BY hatch_timestamp ASC');
  return stmt.all(userId);
}

module.exports = {
  db,
  getUserByUsername,
  createUser,
  getUserById,
  updateUserProgress,
  logLearningMetric,
  getLearningMetricsForUser,

  // Critter functions
  addCritter,
  getCritterById,
  updateCritterStats,
  getCrittersForUser,

  // Egg functions
  addEgg,
  getEggById,
  hatchEgg,
  getUnhatchedEggsForUser
};






