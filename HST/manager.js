'use strict';
// =============================================================================
//  manager.js — Gestor multi-sala con Worker Threads y servidor HTTP
// =============================================================================

const { Worker } = require('worker_threads');
const path = require('path');
const http = require('http');

// Cargar configuraciones de salas
const TODAS_LAS_SALAS = [
  ...require('./salas/co'),
  ...require('./salas/cr'),
  ...require('./salas/us'),
  ...require('./salas/br'),
];

const DELAY_MS = parseInt(process.env.DELAY || '10000');
const salasActivas = new Map(); // id → { worker, cfg }

// Mapa temporal para códigos de registro (código → { auth, workerId })
const registrationCodes = new Map();
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

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
        maxOldGenerationSizeMb: 45,
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
        // Métricas (opcional)
      } else if (msg.type === 'registerCode') {
        // Worker envía un nuevo código de registro
        registrationCodes.set(msg.code, {
          auth: msg.auth,
          workerId: msg.workerId,
          timestamp: Date.now(),
        });
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
      }
    });

  } catch (err) {
    console.error(`[${cfg.id}] ❌ Error al crear Worker: ${err.message}`);
    if (intento < MAX_INTENTOS) {
      setTimeout(() => iniciarSala(cfg, intento + 1), RETRY_DELAY);
    } else {
      console.error(`[${cfg.id}] ⛔ Sin más intentos.`);
    }
  }
}

// ─── Servidor HTTP para el bot de Discord ─────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST' && req.url === '/vincular') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { code, discord_id } = JSON.parse(body);
        const entry = registrationCodes.get(code);

        if (!entry) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Código inválido o expirado.' }));
          return;
        }

        if (Date.now() - entry.timestamp > CODE_EXPIRY_MS) {
          registrationCodes.delete(code);
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Código expirado.' }));
          return;
        }

        const sala = salasActivas.get(entry.workerId);
        if (!sala || !sala.worker) {
          registrationCodes.delete(code);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, message: 'Sala no disponible.' }));
          return;
        }

        sala.worker.postMessage({
          type: 'confirmRegistration',
          auth: entry.auth,
          discord_id,
        });

        registrationCodes.delete(code);

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, playerName: entry.auth }));

      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Error al procesar la solicitud.' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'Ruta no encontrada.' }));
  }
});

server.listen(3456, () => {
  console.log('🌐 Servidor HTTP de registro escuchando en puerto 3456');
});

// ─── Inicio del manager ──────────────────────────────────────────────────
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

  salasValidas.forEach((cfg, i) => {
    setTimeout(() => iniciarSala(cfg), i * DELAY_MS);
  });

  setInterval(() => {
    const mem  = process.memoryUsage();
    const rss  = Math.round(mem.rss      / 1024 / 1024);
    const heap = Math.round(mem.heapUsed / 1024 / 1024);
    console.log(`📊 [${new Date().toLocaleTimeString()}] ${rss}MB RSS | ${heap}MB Heap | ${salasActivas.size}/${salasValidas.length} salas`);
  }, 5 * 60 * 1000);

  setInterval(() => {
    const now = Date.now();
    for (const [code, entry] of registrationCodes) {
      if (now - entry.timestamp > CODE_EXPIRY_MS) {
        registrationCodes.delete(code);
      }
    }
  }, 60_000);
}

process.on('uncaughtException',  (err)    => console.error(`💥 uncaughtException: ${err.message}`));
process.on('unhandledRejection', (reason) => console.error(`💥 unhandledRejection:`, reason));
process.on('SIGINT', () => {
  console.log(`\n🛑 Cerrando workers y servidor HTTP...`);
  server.close();
  for (const [id, { worker }] of salasActivas) {
    worker.terminate();
  }
  process.exit(0);
});

main();
