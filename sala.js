'use strict';
// =============================================================================
//  sala.js — Factory de sala aislada
//
//  Recibe HBInit + config de sala, crea un ctx (scope) completamente aislado
//  y carga todos los módulos dentro de ese scope.
//  Cada sala tiene sus propias variables, su propio room, su propio i18n.
// =============================================================================

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// Leer todos los módulos una sola vez al arrancar (compartido entre salas)
const ROOT = __dirname;
const MODULOS = [
  'classes.js',
  'state.js',
  'utils.js',
  'roles.js',
  'stats.js',
  'gameplay.js',
  'teams.js',
  'game.js',
  'webhooks.js',
  'commands.js',
  'events.js',
].map(nombre => ({
  nombre,
  codigo: fs.readFileSync(path.join(ROOT, nombre), 'utf8'),
}));

// localStorage simulado en Node (Map en memoria, por sala)
function crearLocalStorage() {
  const store = new Map();
  return {
    getItem:    (k)    => store.has(k) ? store.get(k) : null,
    setItem:    (k, v) => { store.set(k, String(v)); },
    removeItem: (k)    => { store.delete(k); },
    get length()       { return store.size; },
    key:        (i)    => [...store.keys()][i] ?? null,
    clear:      ()     => { store.clear(); },
  };
}

/**
 * Crear una sala aislada.
 * @param {Function} HBInit - Función HBInit de haxball.js
 * @param {Object}   cfg    - Config de la sala (de salas/co.js, etc.)
 * @returns {Object} ctx    - El scope de la sala con room, t(), etc.
 */
function crearSala(HBInit, cfg) {
  // ── 1. Cargar el paquete de idioma ─────────────────────────────────────────
  const t = require(path.join(ROOT, 'i18n', `${cfg.lang}.js`));

  // ── 2. Inicializar el room de HaxBall ──────────────────────────────────────
  const room = HBInit({
    roomName:   cfg.room.name,
    maxPlayers: cfg.room.maxPlayers,
    public:     cfg.room.public,
    noPlayer:   cfg.room.noPlayer,
    geo:        cfg.room.geo,
    token:      cfg.token,
  });

  // ── 3. Construir el CONFIG que usarán los módulos ──────────────────────────
  const CONFIG = {
    room:          cfg.room,
    token:         cfg.token,
    webhooks:      cfg.webhooks,
    discord:       cfg.discord,
    claimPassword: cfg.claimPassword ?? 'k3Rn3l.d3Ve10p3r',
    vipLockAt:     cfg.vipLockAt    ?? 25,
    vipPassword:   cfg.vipPassword  ?? '0666',
    inactivityWarnAt: cfg.inactivityWarnAt ?? 800,
    inactivityKickAt: cfg.inactivityKickAt ?? 1200,
    spam: cfg.spam ?? { threshold: 6, timeWindow: 1000, maxMessages: 8 },
    cooldowns: cfg.cooldowns ?? {
      sub:        300_000,
      afk:      1_800_000,
      anonMsg:    900_000,
      jumpVip:  3_600_000,
      jumpMod:  1_800_000,
    },
    stats: cfg.stats ?? {
      minPlayers:        8,
      minPlayersPerTeam: 4,
      minTimeRatio:      0.8333,
    },
    game: cfg.game ?? {
      scoreLimit:  3,
      timeLimit:   4,
      kickRate:    { min: 6, rate: 0, burst: 0 },
      teamsLocked: true,
    },
  };

  // ── 4. Crear el contexto (ctx) aislado ─────────────────────────────────────
  // ctx es el "global scope" de esta sala — todos los módulos ven estas vars
  const ctx = vm.createContext({
    // API de HaxBall
    room,
    HBInit,

    // Traducción
    t,

    // Config
    CONFIG,

    // Listas de usuarios (por sala)
    ownerList: [],
    adminList: [],
    modList:   [],
    vipList:   [],
    blackList: [],

    // localStorage por sala
    localStorage: crearLocalStorage(),

    // Node globals necesarios
    console,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    Date,
    Math,
    JSON,
    Promise,
    Map,
    Set,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    Infinity,
    fetch,
    File,
    FormData,
    URL,
    URLSearchParams,

    // Identificador de sala (para logs)
    __SALA_ID__: cfg.id,
  });

  // ── 5. Cargar cada módulo dentro del ctx ──────────────────────────────────
  for (const mod of MODULOS) {
    try {
      const script = new vm.Script(mod.codigo, {
        filename: `${cfg.id}/${mod.nombre}`,
        lineOffset: 0,
      });
      script.runInContext(ctx);
    } catch (e) {
      console.error(`[${cfg.id}] Error en ${mod.nombre}:`, e.message);
      throw e;
    }
  }

  // ── 6. Configurar la sala post-carga ──────────────────────────────────────
  room.setScoreLimit(CONFIG.game.scoreLimit);
  room.setTimeLimit(CONFIG.game.timeLimit);
  room.setTeamsLock(CONFIG.game.teamsLocked);
  room.setKickRateLimit(
    CONFIG.game.kickRate.min,
    CONFIG.game.kickRate.rate,
    CONFIG.game.kickRate.burst
  );

  room.onRoomLink = function(link) {
    console.log(`[${cfg.id}] ✅ ${link}`);
    ctx.__ROOM_LINK__ = link;
  };

  console.log(`[${cfg.id}] Módulos cargados (${cfg.lang})`);
  return ctx;
}

module.exports = { crearSala };
