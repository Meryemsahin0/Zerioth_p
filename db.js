const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './mu_lab.db';
const db = new sqlite3.Database(dbPath);

// Foreign keys'i aktif et
db.run('PRAGMA foreign_keys = ON');

// Module'ü export et
module.exports = db;