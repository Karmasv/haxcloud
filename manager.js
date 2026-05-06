'use strict';
// =============================================================================
//  manager.js — Gestor multi-sala Liga Promeriga (con Worker Threads)
//
//  Cada sala corre en su propio Worker con límites de memoria.
//  Si un Worker se cae, se reinicia automáticamente.
//
//  Uso:
//    node --expose-gc manager.js
//    PAISES=co,cr node --expose-gc manager.js
//    SALAS=co-x1,us-x3 node --expose-gc manager.js
// =============================================================================

const { Worker } = require('worker_threads');
const path = require('path');

const TODAS_LAS_SALAS = [
  ...require('./salas/co'),
  ...require('./salas/cr'),
  ...require('./salas/us'),
  ...require('./salas/br'),
];

const DELAY_MS = parseInt(process.env.DELAY || '10000');
const salasActivas = new Map(); // id → { worker, cfg }

function filtrarSalas() {
  const paises = process.env.PAISES?.split(',').map(s => s.trim());
  const ids    = process.env.SALAS?.split(',').map(s => s.trim());
  if (ids)    return TODAS_LAS_SALAS.filter(s => ids.includes(s.id));
  if (paises) return TODAS_LAS_SALAS.filter(s => paises.includes(s.id.split('-')[0]));
  return TODAS_LAS_SALAS;
}

function iniciarSala(cfg, intento = 1) {
  const MAX_INTENTOS = 5;
  const RETRY_DELAY  = 30_000;
  console.log(`[${cfg.id}] Iniciando (intento ${intento}/${MAX_INTENTOS})...`);

  try {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: cfg,
      resourceLimits: {
        maxOldGenerationSizeMb: 45, // Heap máximo por sala
        maxYoungGenerationSizeMb: 8,
      },
    });

    worker.on('message', (msg) => {
      if (msg.type === 'ready') {
        salasActivas.set(cfg.id, { worker, cfg });
        console.log(`[${cfg.id}] ✅ Sala activa`);
      } else if (msg.type === 'error') {
        console.error(`[${cfg.id}] ❌ ${msg.message}`);
      } else if (msg.type === 'stats') {
        // Log silencioso de métricas si se desea
        // console.log(`[${cfg.id}] RAM: ${msg.ram}MB | Jugadores: ${msg.players}`);
      }
    });

    worker.on('error', (err) => {
      console.error(`[${cfg.id}] Error de Worker: ${err.message}`);
    });

    worker.on('exit', (code) => {
      salasActivas.delete(cfg.id);
      if (code !== 0 && intento < MAX_INTENTOS) {
        console.warn(`[${cfg.id}] Worker terminó con código ${code}. Reintentando en ${RETRY_DELAY / 1000}s...`);
        setTimeout(() => iniciarSala(cfg, intento + 1), RETRY_DELAY);
      } else if (code !== 0) {
        console.error(`[${cfg.id}] ⛔ Sin más intentos.`);
      } else {
        console.log(`[${cfg.id}] Worker finalizado limpiamente.`);
      }
    });

  } catch (err) {
    console.error(`[${cfg.id}] ❌ Error al crear Worker: ${err.message}`);
    if (intento < MAX_INTENTOS) {
      console.log(`[${cfg.id}] Reintentando en ${RETRY_DELAY / 1000}s...`);
      setTimeout(() => iniciarSala(cfg, intento + 1), RETRY_DELAY);
    } else {
      console.error(`[${cfg.id}] ⛔ Sin más intentos.`);
    }
  }
}

async function main() {
  const salas       = filtrarSalas();
  const sinToken    = salas.filter(s => !s.token || s.token.startsWith('TOKEN_'));
  const salasValidas = salas.filter(s => s.token && !s.token.startsWith('TOKEN_'));

  console.log(`\n🌱 Liga Promeriga Manager (Workers)`);
  console.log(`   Node ${process.version} | PID ${process.pid}`);
  console.log(`   Salas a levantar:  ${salasValidas.length}`);
  if (sinToken.length) console.warn(`   Sin token (omitidas): ${sinToken.map(s => s.id).join(', ')}`);
  console.log(`   Delay entre salas: ${DELAY_MS / 1000}s\n`);

  if (!salasValidas.length) {
    console.error('❌ No hay salas válidas. Revisá los tokens en salas/*.js');
    process.exit(1);
  }

  // Ya no necesitamos inicializar HaxballJS aquí; cada Worker lo hace.
  salasValidas.forEach((cfg, i) => {
    setTimeout(() => iniciarSala(cfg), i * DELAY_MS);
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
process.on('SIGINT', () => {
  console.log(`\n🛑 Cerrando workers...`);
  for (const [id, { worker }] of salasActivas) {
    worker.terminate();
  }
  process.exit(0);
});

main();
