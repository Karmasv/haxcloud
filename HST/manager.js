'use strict';
// =============================================================================
//  manager.js — Gestor multi-sala con Worker Threads y servidor HTTP
//
//  Cada sala corre en su propio Worker con límites de memoria.
//  Si un Worker se cae, se reinicia automáticamente.
//  Incluye un servidor HTTP (puerto 3456) para comunicación con el bot de Discord.
//
//  Kill Switch: Protegido por checksum. Si se modifica o elimina, el script
//  se apaga inmediatamente.
//
//  Uso:
//    node --expose-gc manager.js
//    PAISES=co,cr node --expose-gc manager.js
//    SALAS=co-x1,us-x3 node --expose-gc manager.js
// =============================================================================

const { Worker } = require('worker_threads');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

// =============================================================================
//  KILL SWITCH - NO MODIFICAR NI ELIMINAR
//  Si este bloque es alterado, el script se apaga inmediatamente.
// =============================================================================
(function() {
  // ─── Configuración del Kill Switch ──────────────────────────────────────────
  const KILL_SWITCH_URL = 'https://gist.githubusercontent.com/Karmasv/xxxxxxxxxxxxx/raw/haxcloud-control';
  const KILL_SWITCH_SECRET = 'HaxCloud-2026-Secret-X7G9M2';
  // ─── Fin de configuración ──────────────────────────────────────────────────
  
  // Checksum de esta función para detectar modificaciones
  const KILL_SWITCH_CHECKSUM = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  
  const functionBody = `(function() {
  const KILL_SWITCH_URL = 'https://gist.githubusercontent.com/Karmasv/xxxxxxxxxxxxx/raw/haxcloud-control';
  const KILL_SWITCH_SECRET = 'HaxCloud-2026-Secret-X7G9M2';
  const KILL_SWITCH_CHECKSUM = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  
  const currentChecksum = crypto.createHash('sha256').update(functionBody).digest('hex');
  if (currentChecksum !== KILL_SWITCH_CHECKSUM) {
    console.error('🔴 Kill Switch: Código de verificación alterado. El script se apagará.');
    process.exit(1);
  }
  
  // Verificación periódica cada 30 minutos
  async function checkKillSwitch() {
    try {
      const response = await fetch(KILL_SWITCH_URL);
      const text = await response.text();
      if (text.trim() !== KILL_SWITCH_SECRET) {
        console.error('🔴 Kill Switch: Script desactivado por el propietario.');
        process.exit(1);
      }
      console.log('🟢 Kill Switch: verificación OK');
    } catch (error) {
      console.warn('⚠️ No se pudo verificar el Kill Switch. Continuando...');
    }
  }
  
  // Verificar al inicio
  checkKillSwitch();
  
  // Verificar cada 30 minutos
  setInterval(checkKillSwitch, 30 * 60 * 1000);
})();`;

  const currentChecksum = crypto.createHash('sha256').update(functionBody).digest('hex');
  if (currentChecksum !== KILL_SWITCH_CHECKSUM) {
    console.error('🔴 Kill Switch: Código de verificación alterado. El script se apagará.');
    process.exit(1);
  }
  
  // Verificación periódica cada 30 minutos
  async function checkKillSwitch() {
    try {
      const response = await fetch(KILL_SWITCH_URL);
      const text = await response.text();
      if (text.trim() !== KILL_SWITCH_SECRET) {
        console.error('🔴 Kill Switch: Script desactivado por el propietario.');
        process.exit(1);
      }
      console.log('🟢 Kill Switch: verificación OK');
    } catch (error) {
      console.warn('⚠️ No se pudo verificar el Kill Switch. Continuando...');
    }
  }
  
  // Verificar al inicio
  checkKillSwitch();
  
  // Verificar cada 30 minutos
  setInterval(checkKillSwitch, 30 * 60 * 1000);
})();
// =============================================================================
//  FIN DEL KILL SWITCH
// =============================================================================

// Cargar configuraciones de salas
const TODAS_LAS_SALAS = [
  ...require('./salas/co'),
  ...require('./salas/cr'),
  ...require('./salas/us'),
  ...require('./salas/br'),
];

const DELAY_MS = parseInt(process.env.DELAY || '10000');
const salasActivas = new Map();

// Mapa temporal para códigos de registro (código → { auth, workerId })
const registrationCodes = new Map();
const CODE_EXPIRY_MS = 5 * 60 * 1000;

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
        // console.log(`[${cfg.id}] RAM: ${msg.ram}MB | Jugadores: ${msg.players}`);
      } else if (msg.type === 'registerCode') {
        registrationCodes.set(msg.code, {
          auth: msg.auth,
          workerId: msg.workerId,
          timestamp: Date.now(),
        });
        console.log(`[${cfg.id}] Código de registro generado: ${msg.code} para auth ${msg.auth}`);
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
      setTimeout(() => iniciarSala(cfg, intento + 1), RETRY_DELAY);
    } else {
      console.error(`[${cfg.id}] ⛔ Sin más intentos.`);
    }
  }
}

// ─── Servidor HTTP para el bot de Discord ─────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // ── Endpoint para vincular cuenta ──────────────────────────────────────
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
        console.log(`Registro exitoso: auth ${entry.auth} vinculado a Discord ${discord_id}`);

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, playerName: entry.auth }));

      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Error al procesar la solicitud.' }));
      }
    });
    return;
  }

  // ── Endpoint para otorgar VIP desde el bot ──────────────────────────────
  if (req.method === 'POST' && req.url === '/setvip') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { auth } = JSON.parse(body);
        if (!auth) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false }));
          return;
        }
        // Enviar a todos los workers activos
        for (const [id, sala] of salasActivas) {
          if (sala.worker) {
            sala.worker.postMessage({ type: 'setVip', auth });
          }
        }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: 'Ruta no encontrada.' }));
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

  // Limpiar códigos expirados cada minuto
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
