'use strict';
// =============================================================================
//  manager.js — Gestor multi-sala Liga Promeriga
//
//  Corre hasta 20 salas en UN SOLO proceso Node.
//  HaxballJS() se llama UNA sola vez — todas las salas comparten el runtime.
//
//  Uso:
//    node manager.js                     ← todas las salas activas
//    PAISES=co,cr node manager.js        ← solo Colombia y Costa Rica
//    SALAS=co-x1,us-x3 node manager.js  ← salas específicas
// =============================================================================

const HaxballJS = require('haxball.js').default;
const { crearSala } = require('./sala');

const TODAS_LAS_SALAS = [
  ...require('./salas/co'),
  ...require('./salas/cr'),
  ...require('./salas/us'),
  ...require('./salas/br'),
];

const DELAY_MS = parseInt(process.env.DELAY || '10000');
const salasActivas = new Map();

function filtrarSalas() {
  const paises = process.env.PAISES?.split(',').map(s => s.trim());
  const ids    = process.env.SALAS?.split(',').map(s => s.trim());
  if (ids)    return TODAS_LAS_SALAS.filter(s => ids.includes(s.id));
  if (paises) return TODAS_LAS_SALAS.filter(s => paises.includes(s.id.split('-')[0]));
  return TODAS_LAS_SALAS;
}

async function iniciarSala(HBInit, cfg, intento = 1) {
  const MAX_INTENTOS = 5;
  const RETRY_DELAY  = 30_000;
  console.log(`[${cfg.id}] Iniciando (intento ${intento}/${MAX_INTENTOS})...`);
  try {
    if (salasActivas.has(cfg.id)) salasActivas.delete(cfg.id);
    const ctx = crearSala(HBInit, cfg);
    salasActivas.set(cfg.id, ctx);
    console.log(`[${cfg.id}] ✅ Sala activa`);
  } catch (err) {
    console.error(`[${cfg.id}] ❌ Error: ${err.message}`);
    if (intento < MAX_INTENTOS) {
      console.log(`[${cfg.id}] Reintentando en ${RETRY_DELAY/1000}s...`);
      setTimeout(() => iniciarSala(HBInit, cfg, intento + 1), RETRY_DELAY);
    } else {
      console.error(`[${cfg.id}] ⛔ Sin más intentos.`);
    }
  }
}

async function main() {
  const salas       = filtrarSalas();
  const sinToken    = salas.filter(s => !s.token || s.token.startsWith('TOKEN_'));
  const salasValidas = salas.filter(s => s.token && !s.token.startsWith('TOKEN_'));

  console.log(`\n🌱 Liga Promeriga Manager`);
  console.log(`   Node ${process.version} | PID ${process.pid}`);
  console.log(`   Salas a levantar:  ${salasValidas.length}`);
  if (sinToken.length) console.warn(`   Sin token (omitidas): ${sinToken.map(s => s.id).join(', ')}`);
  console.log(`   Delay entre salas: ${DELAY_MS/1000}s\n`);

  if (!salasValidas.length) {
    console.error('❌ No hay salas válidas. Revisá los tokens en salas/*.js');
    process.exit(1);
  }

  console.log('Inicializando HaxballJS (una sola vez para todas las salas)...');
  let HBInit;
  try {
    HBInit = await HaxballJS();
    console.log('✅ HaxballJS listo.\n');
  } catch (err) {
    console.error('❌ Error inicializando HaxballJS:', err);
    process.exit(1);
  }

  salasValidas.forEach((cfg, i) => {
    setTimeout(() => iniciarSala(HBInit, cfg), i * DELAY_MS);
  });

  setInterval(() => {
    const mem  = process.memoryUsage();
    const rss  = Math.round(mem.rss      / 1024 / 1024);
    const heap = Math.round(mem.heapUsed / 1024 / 1024);
    console.log(`📊 [${new Date().toLocaleTimeString()}] ${rss}MB RSS | ${heap}MB Heap | ${salasActivas.size}/${salasValidas.length} salas`);
  }, 5 * 60 * 1000);
}

process.on('uncaughtException',  (err)    => console.error(`💥 uncaughtException: ${err.message}`));
process.on('unhandledRejection', (reason) => console.error(`💥 unhandledRejection:`, reason));
process.on('SIGINT', () => { console.log(`\n🛑 Cerrando...`); process.exit(0); });

main();
