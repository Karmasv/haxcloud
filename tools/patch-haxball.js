#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Rutas
const ORIGINAL = path.join(__dirname, '..', 'node_modules', 'haxball.js', 'dist', 'index.cjs');
const BACKUP = ORIGINAL + '.backup';
const PATCHED = path.join(__dirname, '..', 'lib', 'haxball-patched.cjs');

// Verificar que existe el original
if (!fs.existsSync(ORIGINAL)) {
  console.error('❌ No se encontró node_modules/haxball.js/dist/index.cjs');
  console.error('   Ejecuta primero: npm install haxball.js');
  process.exit(1);
}

console.log('📂 Leyendo haxball.js original...');
let source = fs.readFileSync(ORIGINAL, 'utf8');
const originalSize = source.length;

// Crear backup si no existe
if (!fs.existsSync(BACKUP)) {
  fs.copyFileSync(ORIGINAL, BACKUP);
  console.log('✅ Backup creado:', BACKUP);
}

let parchesAplicados = 0;

// ─── Parche 1: Exponer player.activity ────────────────────────────────
const patronActivity = /return\{name:(\w+),team:(\w+),id:(\w+),admin:(\w+),position:(\w+)\}/;
if (patronActivity.test(source)) {
  source = source.replace(
    patronActivity,
    'return{name:$1,team:$2,id:$3,admin:$4,position:$5,activity:$.Jb}'
  );
  console.log('  ✅ player.activity expuesto');
  parchesAplicados++;
} else {
  // Intentar con otro patrón (el código ofuscado puede variar)
  const patronAlt = /return\{name:(h\.\w+),team:(h\.\w+\.\w+),id:(h\.\w+),admin:(h\.\w+),position:(\w+)\}/;
  if (patronAlt.test(source)) {
    source = source.replace(
      patronAlt,
      'return{name:$1,team:$2,id:$3,admin:$4,position:$5,activity:h.Jb}'
    );
    console.log('  ✅ player.activity expuesto (patrón alternativo)');
    parchesAplicados++;
  } else {
    console.warn('  ⚠️  No se encontró el patrón para player.activity');
  }
}

// ─── Parche 2: Tick interval 50ms → 80ms ──────────────────────────────
if (source.includes('setInterval(function(){E.Ca()},50)')) {
  source = source.replace(
    'setInterval(function(){E.Ca()},50)',
    'setInterval(function(){E.Ca()},80)'
  );
  console.log('  ✅ Tick interval: 50ms → 80ms');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró tick interval de 50ms');
}

// ─── Parche 3: Heartbeat 3000ms → 6000ms ──────────────────────────────
const patronHeartbeat = /setInterval\(function\(\)\{(\w+)\.nc\((\w+)\.V\(\1\)\)\},3000\)/;
if (patronHeartbeat.test(source)) {
  source = source.replace(patronHeartbeat, 'setInterval(function(){$1.nc($2.V($1))},6000)');
  console.log('  ✅ Heartbeat: 3000ms → 6000ms');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró heartbeat de 3000ms');
}

// ─── Parche 4: Snapshot interval ─────────────────────────────────────
if (source.includes('this.Cg=600')) {
  source = source.replace('this.Cg=600', 'this.Cg=1200');
  console.log('  ✅ Snapshot interval: 600 → 1200 ticks');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró snapshot interval');
}

// ─── Parche 5: WebRTC limit ──────────────────────────────────────────
if (source.includes('16<=this.xb.size')) {
  source = source.replace('16<=this.xb.size', '32<=this.xb.size');
  console.log('  ✅ WebRTC limit: 16 → 32');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró límite WebRTC');
}

// ─── Guardar versión parcheada ────────────────────────────────────────
if (parchesAplicados === 0) {
  console.error('\n❌ No se aplicó ningún parche. El código fuente puede haber cambiado.');
  process.exit(1);
}

// Asegurar que existe la carpeta lib/
const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

fs.writeFileSync(PATCHED, source, 'utf8');
const patchedSize = fs.statSync(PATCHED).size;
const diff = patchedSize - originalSize;

console.log(`\n✅ haxball-patched.cjs generado (${(patchedSize/1024).toFixed(1)} KB)`);
console.log(`   Parches aplicados: ${parchesAplicados}`);
console.log(`   Diferencia: ${diff > 0 ? '+' : ''}${diff} bytes`);
console.log(`   Ubicación: ${PATCHED}`);
