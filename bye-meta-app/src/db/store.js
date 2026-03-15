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
      photo_uris TEXT, -- Stored as JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function saveEntry(textContent, photoUris) {
  const database = await getDb();
  const statement = await database.prepareAsync(
    'INSERT INTO entries (text_content, photo_uris) VALUES ($textContent, $photoUris)'
  );
  try {
    const result = await statement.executeAsync({
      $textContent: textContent,
      $photoUris: JSON.stringify(photoUris),
    });
    return result.lastInsertRowId;
  } finally {
    await statement.finalizeAsync();
  }
}

export async function getEntries() {
  const database = await getDb();
  const allRows = await database.getAllAsync('SELECT * FROM entries ORDER BY created_at DESC');
  return allRows.map(row => ({
    ...row,
    photo_uris: JSON.parse(row.photo_uris)
  }));
}
