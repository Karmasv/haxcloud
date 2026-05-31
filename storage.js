'use strict';
// =============================================================================
//  storage.js — Base de datos SQLite (con tienda)
// =============================================================================

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'haxcloud.db');

let db;
function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
    db.pragma('foreign_keys = ON');
    createTables();
  }
  return db;
}

function createTables() {
  const d = getDB();
  d.exec(`
    CREATE TABLE IF NOT EXISTS players (
      auth TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Unknown',
      coins INTEGER NOT NULL DEFAULT 0,
      last_daily TEXT,
      discord_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stats (
      auth TEXT PRIMARY KEY,
      games INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      goals INTEGER NOT NULL DEFAULT 0,
      assists INTEGER NOT NULL DEFAULT 0,
      cs INTEGER NOT NULL DEFAULT 0,
      own_goals INTEGER NOT NULL DEFAULT 0,
      playtime INTEGER NOT NULL DEFAULT 0,
      xp INTEGER NOT NULL DEFAULT 0,
      mvp_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (auth) REFERENCES players(auth) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_value TEXT NOT NULL,
      equipped INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (auth) REFERENCES players(auth) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS player_ips (
      auth TEXT NOT NULL,
      ip TEXT NOT NULL,
      last_seen TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (auth, ip)
    );
  `);
}

// ─── Funciones de jugadores ─────────────────────────────────────────────────

function getPlayer(auth) {
  const d = getDB();
  return d.prepare('SELECT * FROM players WHERE auth = ?').get(auth) || null;
}

function createPlayer(auth, name) {
  const d = getDB();
  d.prepare('INSERT OR IGNORE INTO players (auth, name) VALUES (?, ?)').run(auth, name);
  d.prepare('UPDATE players SET name = ? WHERE auth = ? AND name = \'Unknown\'').run(name, auth);
  return getPlayer(auth);
}

function getCoins(auth) {
  const p = getPlayer(auth);
  return p ? p.coins : 0;
}

function addCoins(auth, amount) {
  const d = getDB();
  d.prepare('UPDATE players SET coins = coins + ? WHERE auth = ?').run(amount, auth);
}

function removeCoins(auth, amount) {
  const d = getDB();
  d.prepare('UPDATE players SET coins = MAX(0, coins - ?) WHERE auth = ?').run(amount, auth);
}

function transferCoins(fromAuth, toAuth, amount) {
  const d = getDB();
  const from = getPlayer(fromAuth);
  if (!from || from.coins < amount) return false;
  d.transaction(() => {
    removeCoins(fromAuth, amount);
    addCoins(toAuth, amount);
  })();
  return true;
}

function setLastDaily(auth, date) {
  const d = getDB();
  d.prepare('UPDATE players SET last_daily = ? WHERE auth = ?').run(date, auth);
}

function getLastDaily(auth) {
  const p = getPlayer(auth);
  return p ? p.last_daily : null;
}

function setDiscordID(auth, discord_id) {
  const d = getDB();
  d.prepare('UPDATE players SET discord_id = ? WHERE auth = ?').run(discord_id, auth);
}

// ─── Funciones de estadísticas ───────────────────────────────────────────────

function getStats(auth) {
  const d = getDB();
  let row = d.prepare('SELECT * FROM stats WHERE auth = ?').get(auth);
  if (!row) {
    d.prepare('INSERT INTO stats (auth) VALUES (?)').run(auth);
    row = d.prepare('SELECT * FROM stats WHERE auth = ?').get(auth);
  }
  return row;
}

function saveStats(auth, stats) {
  const d = getDB();
  d.prepare(`
    UPDATE stats SET
      games = ?, wins = ?, losses = ?, goals = ?, assists = ?,
      cs = ?, own_goals = ?, playtime = ?, xp = ?, mvp_count = ?
    WHERE auth = ?
  `).run(
    stats.games, stats.wins, stats.losses, stats.goals, stats.assists,
    stats.cs, stats.own_goals, stats.playtime, stats.xp, stats.mvp_count,
    auth
  );
}

function getAllPlayerStats() {
  const d = getDB();
  return d.prepare(`
    SELECT p.name as playerName, s.*
    FROM stats s
    JOIN players p ON s.auth = p.auth
    ORDER BY s.xp DESC
  `).all();
}

// ─── Funciones de IPs ────────────────────────────────────────────────────────

function logIP(auth, ip) {
  const d = getDB();
  d.prepare(`
    INSERT INTO player_ips (auth, ip, last_seen)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(auth, ip) DO UPDATE SET last_seen = datetime('now')
  `).run(auth, ip);
}

function getLastIP(auth) {
  const d = getDB();
  const row = d.prepare('SELECT ip FROM player_ips WHERE auth = ? ORDER BY last_seen DESC LIMIT 1').get(auth);
  return row ? row.ip : null;
}

// ─── Funciones de tienda e inventario ────────────────────────────────────────

const SHOP_ITEMS = [
  { type: 'vcolor', name: 'Color de nombre', price: 50, desc: 'Cambia el color de tu nombre en el chat por 30 días.' },
  { type: 'prefijo', name: 'Prefijo personalizado', price: 75, desc: 'Añade un prefijo antes de tu nombre (máx. 10 caracteres).' },
  { type: 'vipavatar', name: 'Avatar VIP', price: 100, desc: 'Recibe un avatar aleatorio especial durante 24 horas.' },
];

function getShopItems() {
  return SHOP_ITEMS;
}

function addItem(auth, itemType, itemValue) {
  const d = getDB();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  d.prepare('INSERT INTO inventory (auth, item_type, item_value, expires_at) VALUES (?, ?, ?, ?)').run(auth, itemType, itemValue, expiresAt);
}

function equipItem(auth, itemType, itemValue) {
  const d = getDB();
  d.transaction(() => {
    d.prepare('UPDATE inventory SET equipped = 0 WHERE auth = ? AND item_type = ?').run(auth, itemType);
    d.prepare('UPDATE inventory SET equipped = 1 WHERE auth = ? AND item_type = ? AND item_value = ?').run(auth, itemType, itemValue);
  })();
}

function unequipItem(auth, itemType) {
  const d = getDB();
  d.prepare('UPDATE inventory SET equipped = 0 WHERE auth = ? AND item_type = ?').run(auth, itemType);
}

function getEquipped(auth, itemType) {
  const d = getDB();
  const row = d.prepare('SELECT item_value FROM inventory WHERE auth = ? AND item_type = ? AND equipped = 1').get(auth, itemType);
  return row ? row.item_value : null;
}

function getInventory(auth) {
  const d = getDB();
  return d.prepare('SELECT * FROM inventory WHERE auth = ?').all(auth);
}

function getPlayerItem(auth, itemType) {
  const d = getDB();
  return d.prepare('SELECT * FROM inventory WHERE auth = ? AND item_type = ? AND equipped = 1').get(auth, itemType) || null;
}

function removeItem(itemId) {
  const d = getDB();
  d.prepare('DELETE FROM inventory WHERE id = ?').run(itemId);
}

function getExpiredItems() {
  const d = getDB();
  return d.prepare("SELECT * FROM inventory WHERE expires_at IS NOT NULL AND datetime(expires_at) < datetime('now')").all();
}

module.exports = {
  getDB,
  getPlayer,
  createPlayer,
  getCoins,
  addCoins,
  removeCoins,
  transferCoins,
  setLastDaily,
  getLastDaily,
  setDiscordID,
  getStats,
  saveStats,
  getAllPlayerStats,
  logIP,
  getLastIP,
  getShopItems,
  addItem,
  equipItem,
  unequipItem,
  getEquipped,
  getInventory,
  getPlayerItem,
  removeItem,
  getExpiredItems,
};
