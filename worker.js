'use strict';
// =============================================================================
//  worker.js — Punto de entrada de una sala aislada
//
//  Se ejecuta dentro de un Worker Thread.
//  Cada Worker tiene su propio event loop, su propia memoria,
//  y sus propias variables globales.
// =============================================================================

const { parentPort, workerData } = require('worker_threads');
const { crearSala } = require('./sala');

const cfg = workerData;

async function iniciar() {
  try {
    // Cargar haxball.js parcheado (o el original si no existe el parche)
    let HaxballJS;
    try {
      HaxballJS = require('./lib/haxball-patched.cjs').default;
    } catch {
      HaxballJS = require('haxball.js').default;
    }

    const HBInit = await HaxballJS();
    const ctx = crearSala(HBInit, cfg);

    // Notificar al manager que la sala está lista
    parentPort.postMessage({ type: 'ready', id: cfg.id });

    // Enviar métricas periódicas al manager (cada 30s)
    setInterval(() => {
      const mem = process.memoryUsage();
      parentPort.postMessage({
        type: 'stats',
        id: cfg.id,
        ram: Math.round(mem.heapUsed / 1024 / 1024),
        players: ctx.room?.getPlayerList().length ?? 0,
      });

      // Forzar GC si está disponible (--expose-gc)
      if (global.gc) {
        global.gc();
      }
    }, 30000);

  } catch (err) {
    parentPort.postMessage({ type: 'error', id: cfg.id, message: err.message });
    throw err;
  }
}

iniciar();
