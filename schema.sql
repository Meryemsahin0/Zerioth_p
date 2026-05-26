-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı ilerleme tablosu
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  current_stage INTEGER DEFAULT 1,
  completed_stages TEXT DEFAULT '[]',
  total_points INTEGER DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Aşama başarıları tablosu
CREATE TABLE IF NOT EXISTS stage_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stage_number INTEGER NOT NULL CHECK(stage_number >= 1 AND stage_number <= 5),
  flag_submitted TEXT,
  is_correct INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  completed_at DATETIME,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, stage_number),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Saldırı simülasyonları tablosu
CREATE TABLE IF NOT EXISTS attack_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  stage_number INTEGER NOT NULL,
  attack_type TEXT,
  detected INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_progress ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_completions ON stage_completions(user_id, stage_number);
CREATE INDEX IF NOT EXISTS idx_attack_logs ON attack_logs(user_id, stage_number);