#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGINAL = path.join(ROOT, 'node_modules', 'haxball.js', 'dist', 'index.cjs');
const BACKUP = ORIGINAL + '.backup';
const PATCHED = path.join(ROOT, 'lib', 'haxball-patched.cjs');

if (!fs.existsSync(ORIGINAL)) {
  console.error('❌ No se encontró node_modules/haxball.js/dist/index.cjs');
  process.exit(1);
}

console.log('📂 Leyendo haxball.js original...');
let source = fs.readFileSync(ORIGINAL, 'utf8');
const originalSize = source.length;

if (!fs.existsSync(BACKUP)) {
  fs.copyFileSync(ORIGINAL, BACKUP);
  console.log('✅ Backup creado:', BACKUP);
}

let parchesAplicados = 0;

// ─── Parche 1: Exponer player.activity y player.conn ─────────────────
// Buscar el objeto {name:U.pa,team:U.ja.P,id:U.ma,admin:U.Cb,position:J}
const patronZ = /\{name:U\.pa,team:U\.ja\.P,id:U\.ma,admin:U\.Cb,position:J\}/;
if (patronZ.test(source)) {
  source = source.replace(patronZ,
    '{name:U.pa,team:U.ja.P,id:U.ma,admin:U.Cb,position:J,activity:U.Kb,conn:(E.wb.get(U.ma)||{}).hb||null}'
  );
  console.log('  ✅ player.activity y player.conn expuestos');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró el objeto PlayerObject para exponer activity/conn');
}

// ─── Parche 2: Tick interval 50ms → 80ms ─────────────────────────────
if (source.includes('setInterval(function(){E.Ca()},50)')) {
  source = source.replace('setInterval(function(){E.Ca()},50)', 'setInterval(function(){E.Ca()},80)');
  console.log('  ✅ Tick interval: 50ms → 80ms');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró tick interval');
}

// ─── Parche 3: Heartbeat 3000ms → 6000ms ─────────────────────────────
if (source.includes('setInterval(function(){E.nc(U0.V(E))},3000)')) {
  source = source.replace('setInterval(function(){E.nc(U0.V(E))},3000)', 'setInterval(function(){E.nc(U0.V(E))},6000)');
  console.log('  ✅ Heartbeat: 3000ms → 6000ms');
  parchesAplicados++;
} else {
  console.warn('  ⚠️  No se encontró heartbeat');
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

// ─── Guardar ─────────────────────────────────────────────────────────
if (!fs.existsSync(path.join(ROOT, 'lib'))) {
  fs.mkdirSync(path.join(ROOT, 'lib'), { recursive: true });
}
fs.writeFileSync(PATCHED, source, 'utf8');
const newSize = fs.statSync(PATCHED).size;
console.log(`\n✅ haxball-patched.cjs generado (${(newSize/1024).toFixed(1)} KB)`);
console.log(`   Parches aplicados: ${parchesAplicados}/5`);