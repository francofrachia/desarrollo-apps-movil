import * as SQLite from 'expo-sqlite';

let dbCache = null;

export const getDBConnection = async () => {
  if (dbCache) return dbCache;
  dbCache = await SQLite.openDatabaseAsync('qos_monitor.db');
  return dbCache;
};

export const createTable = async () => {
  const db = await getDBConnection();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      lat REAL,
      lng REAL,
      ping REAL,
      download REAL,
      upload REAL,
      network_type TEXT,
      carrier TEXT,
      rssi INTEGER
    );
  `);
};

export const saveMeasurement = async (data) => {
  const db = await getDBConnection();
  await db.runAsync(
    `INSERT INTO measurements (timestamp, lat, lng, ping, download, upload, network_type, carrier, rssi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.timestamp || new Date().toISOString(),
    data.lat || 0,
    data.lng || 0,
    data.ping || 0,
    data.download || 0,
    data.upload || 0,
    data.network_type || 'Unknown',
    data.carrier || 'Unknown',
    data.rssi || 0
  );
};

export const getMeasurements = async () => {
  try {
    const db = await getDBConnection();
    const allRows = await db.getAllAsync('SELECT * FROM measurements ORDER BY id DESC');
    return allRows;
  } catch (error) {
    console.error('Error getting measurements:', error);
    return [];
  }
};
