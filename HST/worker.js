'use strict';
// =============================================================================
//  worker.js — Punto de entrada de una sala aislada (con SQLite)
// =============================================================================

const { parentPort, workerData } = require('worker_threads');
const { crearSala } = require('./sala');

const cfg = workerData;

async function iniciar() {
  try {
    // Cargar haxball.js parcheado
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

    // Escuchar mensajes del manager (registro Discord)
    parentPort.on('message', (msg) => {
      if (msg.type === 'confirmRegistration') {
        const { auth, discord_id } = msg;
        const storage = require('./storage');
        storage.createPlayer(auth, 'Unknown');
        storage.setDiscordID(auth, discord_id);
        console.log(`[${cfg.id}] Discord vinculado: ${discord_id}`);
      }
    });

  } catch (err) {
    parentPort.postMessage({ type: 'error', id: cfg.id, message: err.message });
    throw err;
  }
}

iniciar();
