'use strict';
// =============================================================================
//  worker.js — Punto de entrada de una sala aislada
// =============================================================================

const { parentPort, workerData } = require('worker_threads');
const { crearSala } = require('./sala');

const cfg = workerData;

async function iniciar() {
  try {
    let HaxballJS;
    try {
      HaxballJS = require('./lib/haxball-patched.cjs').default;
    } catch {
      HaxballJS = require('haxball.js').default;
    }

    const HBInit = await HaxballJS();
    const ctx = crearSala(HBInit, cfg);

    parentPort.postMessage({ type: 'ready', id: cfg.id });

    setInterval(() => {
      const mem = process.memoryUsage();
      parentPort.postMessage({
        type: 'stats',
        id: cfg.id,
        ram: Math.round(mem.heapUsed / 1024 / 1024),
        players: ctx.room?.getPlayerList().length ?? 0,
      });
      if (global.gc) global.gc();
    }, 30000);

    // Escuchar mensajes del manager
    parentPort.on('message', (msg) => {
      if (msg.type === 'confirmRegistration') {
        const { auth, discord_id } = msg;
        // Guardar vinculación en localStorage del worker
        if (global.localStorage && global.getStats && global.saveStats) {
          const stats = global.getStats(auth);
          if (stats) {
            stats.discord_id = discord_id;
            global.saveStats(auth, stats);
          }
        }
        console.log(`[${cfg.id}] ✅ Discord vinculado para auth ${auth}: ${discord_id}`);
      }
    });

  } catch (err) {
    parentPort.postMessage({ type: 'error', id: cfg.id, message: err.message });
    throw err;
  }
}

iniciar();
