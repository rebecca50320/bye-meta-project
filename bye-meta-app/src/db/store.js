import * as SQLite from 'expo-sqlite';

let db;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('byemeta.db');
  }
  return db;
}

export async function initDb() {
  const database = await getDb();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text_content TEXT,
      photo_uris TEXT,
      nostr_event_id TEXT,
      publish_state TEXT DEFAULT 'local',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Migrate existing installs that lack the new columns
  try {
    await database.execAsync(`ALTER TABLE entries ADD COLUMN nostr_event_id TEXT`);
  } catch {}
  try {
    await database.execAsync(`ALTER TABLE entries ADD COLUMN publish_state TEXT DEFAULT 'local'`);
  } catch {}
}

export async function saveEntry(textContent, photoUris, nostrEventId = null, publishState = 'local') {
  const database = await getDb();
  const statement = await database.prepareAsync(
    'INSERT INTO entries (text_content, photo_uris, nostr_event_id, publish_state) VALUES ($textContent, $photoUris, $nostrEventId, $publishState)'
  );
  try {
    const result = await statement.executeAsync({
      $textContent: textContent,
      $photoUris: JSON.stringify(photoUris),
      $nostrEventId: nostrEventId,
      $publishState: publishState,
    });
    return result.lastInsertRowId;
  } finally {
    await statement.finalizeAsync();
  }
}

export async function getAllEntriesForExport() {
  const database = await getDb();
  const rows = await database.getAllAsync('SELECT * FROM entries ORDER BY created_at ASC');
  return rows.map(row => ({ ...row, photo_uris: JSON.parse(row.photo_uris) }));
}

export async function updateEntryPublishState(id, publishState, nostrEventId = null) {
  const database = await getDb();
  await database.runAsync(
    'UPDATE entries SET publish_state = ?, nostr_event_id = ? WHERE id = ?',
    [publishState, nostrEventId, id]
  );
}

export async function getEntries() {
  const database = await getDb();
  const allRows = await database.getAllAsync('SELECT * FROM entries ORDER BY created_at DESC');
  return allRows.map(row => ({
    ...row,
    photo_uris: JSON.parse(row.photo_uris)
  }));
}
