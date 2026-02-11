import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize SQLite database in project root
const db = new Database(join(process.cwd(), 'chat-history.db'));

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS chat_history (
  id TEXT PRIMARY KEY,
  persona_id TEXT NOT NULL,
  messages TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

export function getChatHistory(id) {
  const row = db
    .prepare('SELECT messages FROM chat_history WHERE id = ?')
    .get(id);
  return row ? JSON.parse(row.messages) : [];
}

export function saveChatHistory(id, personaId, messages) {
  const messagesStr = JSON.stringify(messages);
  db.prepare(
    `INSERT INTO chat_history (id, persona_id, messages, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET messages=excluded.messages, updated_at=CURRENT_TIMESTAMP`
  ).run(id, personaId, messagesStr);
}

export function deleteChatHistory(id) {
  db.prepare('DELETE FROM chat_history WHERE id = ?').run(id);
}

export function listChatsForPersona(personaId) {
  return db
    .prepare(
      'SELECT id, created_at, updated_at FROM chat_history WHERE persona_id = ? ORDER BY updated_at DESC'
    )
    .all(personaId);
}

export function createChatId() {
  return crypto.randomUUID();
}
