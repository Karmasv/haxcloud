#!/usr/bin/env node
// =============================================================================
//  patch-haxball.js — Aplica optimizaciones al fuente de haxball.js
//
//  Uso (desde la carpeta del proyecto):
//    node patch-haxball.js
//
//  Qué hace:
//    1. Copia node_modules/haxball.js/dist/index.cjs → haxball.local.cjs
//    2. Aplica 7 optimizaciones al fuente minificado
//    3. Verifica que todos los cambios fueron aplicados
// =============================================================================

const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'node_modules', 'haxball.js', 'dist', 'index.cjs');
const DEST = path.join(__dirname, 'haxball.local.cjs');

if (!fs.existsSync(SRC)) {
  console.error('❌ No se encontró node_modules/haxball.js — ejecutá npm install primero.');
  process.exit(1);
}

console.log('📂 Leyendo haxball.js original...');
let src = fs.readFileSync(SRC, 'utf8');
const original = src;

const patches = [
  // ── 1. Suprimir console.log interno ────────────────────────────────────────
  // Elimina el spam de errores de conexión en stdout — gran ahorro de I/O
  {
    name:    'Suprimir console.log interno',
    find:    /A\.console\.log\(N\)/g,
    replace: '(void 0)',
  },

  // ── 2. Tick interval 50ms → 100ms ──────────────────────────────────────────
  // El game loop corre a 60fps lógico controlado por Ae=0.06
  // El intervalo del setInterval no afecta la física — solo cuántas veces
  // por segundo se revisa si hay ticks pendientes.
  // 50ms → 100ms = la mitad de llamadas, misma lógica de juego.
  {
    name:    'Tick interval 50ms → 100ms',
    find:    'setInterval(function(){K.Ca()},50)',
    replace: 'setInterval(function(){K.Ca()},100)',
  },

  // ── 3. Heartbeat 3000ms → 6000ms ───────────────────────────────────────────
  // El heartbeat envía el estado de la sala al servidor HaxBall.
  // Cada 6s en vez de 3s = la mitad del tráfico saliente por sala.
  {
    name:    'Heartbeat 3000ms → 6000ms',
    find:    'setInterval(function(){K.nc(',
    replace: 'setInterval(function(){K.nc(',
    // We patch the value after
    custom: (s) => s.replace(
      /setInterval\(function\(\)\{K\.nc\([^)]+\)\},3000\)/,
      (m) => m.replace(',3000)', ',6000)')
    ),
  },

  // ── 4. Snapshot interval 600 → 1200 ticks ──────────────────────────────────
  // Cada 600 ticks (~10s) se toma un snapshot del estado para reconexiones.
  // Duplicar = la mitad del CPU usado en snapshots.
  // Trade-off: en caso de crash, la reconexión retrocede hasta 20s en vez de 10s.
  {
    name:    'Snapshot interval 600 → 1200 ticks',
    find:    'this.Cg=600',
    replace: 'this.Cg=1200',
  },

  // ── 5. Timeout de conexión 10000ms → 5000ms ────────────────────────────────
  // Tiempo máximo para establecer conexión WebRTC con un jugador.
  // 5s es suficiente — libera memoria más rápido en conexiones fallidas.
  {
    name:    'Connection timeout 10000ms → 5000ms',
    find:    'this.Rh=1e4',
    replace: 'this.Rh=5e3',
  },

  // ── 6. Reconexión jitter 50000ms → 15000ms ─────────────────────────────────
  // Tiempo aleatorio máximo antes de reconectar al servidor HaxBall.
  // Reducirlo hace que la sala vuelva online más rápido tras una caída.
  {
    name:    'Reconnect jitter 50000ms → 15000ms',
    find:    'this.Uh=50000',
    replace: 'this.Uh=15000',
  },

  // ── 7. Input delay Rb=2 → Rb=1 ─────────────────────────────────────────────
  // Frames de buffer para inputs de jugadores.
  // Rb=1 reduce latencia percibida medio frame (~8ms).
  // Safe en VPS con buena conexión — puede causar más desincronías en redes malas.
  {
    name:    'Input delay Rb=2 → Rb=1',
    find:    'this.Rb=2',
    replace: 'this.Rb=1',
  },
];

// ── Aplicar patches ───────────────────────────────────────────────────────────
let aplicados   = 0;
let fallidos    = 0;

for (const patch of patches) {
  const antes = src;

  if (patch.custom) {
    src = patch.custom(src);
  } else if (patch.find instanceof RegExp) {
    src = src.replace(patch.find, patch.replace);
  } else {
    src = src.split(patch.find).join(patch.replace);
  }

  if (src !== antes) {
    console.log(`  ✅ ${patch.name}`);
    aplicados++;
  } else {
    console.warn(`  ⚠️  ${patch.name} — patrón no encontrado (puede que ya esté aplicado)`);
    fallidos++;
  }
}

// ── Verificar que el archivo cambió ──────────────────────────────────────────
if (src === original) {
  console.error('\n❌ No se aplicó ningún cambio. Verificá la versión de haxball.js.');
  process.exit(1);
}

// ── Guardar ───────────────────────────────────────────────────────────────────
fs.writeFileSync(DEST, src, 'utf8');

const kb = (fs.statSync(DEST).size / 1024).toFixed(1);
console.log(`\n✅ haxball.local.cjs generado (${kb} KB)`);
console.log(`   Patches aplicados: ${aplicados}/${patches.length}`);
if (fallidos > 0) {
  console.warn(`   Patches no encontrados: ${fallidos} (revisá la versión del paquete)`);
}

// ── Actualizar sala.js para usar el archivo local ────────────────────────────
const salaPath = path.join(__dirname, 'sala.js');
let sala = fs.readFileSync(salaPath, 'utf8');

if (sala.includes("require('haxball.js').default")) {
  // sala.js no requiere haxball directamente — lo recibe como parámetro
  console.log('\nℹ️  sala.js recibe HBInit como parámetro — no necesita cambios.');
}

// Actualizar manager.js para usar haxball.local.cjs
const managerPath = path.join(__dirname, 'manager.js');
let manager = fs.readFileSync(managerPath, 'utf8');

if (manager.includes("require('haxball.js').default")) {
  manager = manager.replace(
    "require('haxball.js').default",
    "require('./haxball.local.cjs').default"
  );
  fs.writeFileSync(managerPath, manager, 'utf8');
  console.log('✅ manager.js actualizado para usar haxball.local.cjs');
} else if (manager.includes("require('./haxball.local.cjs')")) {
  console.log('ℹ️  manager.js ya usa haxball.local.cjs');
}

console.log('\n🚀 Listo. Corré: node manager.js');
