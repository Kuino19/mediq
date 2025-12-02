import { createClient } from '@libsql/client';
import path from 'path';

console.log('Resolved DB Path:', path.resolve('./local.db'));

const client = createClient({
  url: "file:./local.db",
});

console.log('🔄 Initializing database...');

// Create tables using SQL
const sql = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK(role IN ('patient', 'doctor', 'admin')),
  hospital_id INTEGER REFERENCES hospitals(id),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  specialty TEXT
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL UNIQUE,
  summary_text TEXT NOT NULL,
  triage_code TEXT NOT NULL CHECK(triage_code IN ('red', 'yellow', 'green')),
  suggested_next_steps TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'follow-up')),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Queue table
CREATE TABLE IF NOT EXISTS queue (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  summary_id INTEGER NOT NULL UNIQUE REFERENCES summaries(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'in-progress', 'completed')),
  priority INTEGER NOT NULL DEFAULT 3,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK(sender IN ('user', 'bot')),
  conversation_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Insert default hospital
INSERT OR IGNORE INTO hospitals (id, name, address) VALUES (1, 'KinetiQ General Hospital', '123 Medical Center Dr');

-- Insert default test user
INSERT OR IGNORE INTO users (id, full_name, email, password, role, hospital_id) 
VALUES (1, 'Test Patient', 'patient@test.com', 'password123', 'patient', 1);
`;

// Split SQL into individual statements
const statements = sql.split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

try {
  console.log(`Executing ${statements.length} SQL statements...`);
  for (const statement of statements) {
    await client.execute(statement);
  }
  console.log('✅ Database initialized successfully!');
  console.log('✅ Created tables: users, hospitals, doctors, summaries, queue, chats');
  console.log('✅ Inserted default hospital and test user');

  // Verify tables exist
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('📊 Tables found:', result.rows.map(r => r.name));

} catch (error) {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
}

process.exit(0);
