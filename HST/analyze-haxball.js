#!/usr/bin/env node
// =============================================================================
//  analyze-haxball.js — Analiza el fuente de haxball.js para encontrar
//  todos los puntos optimizables
// =============================================================================

const fs   = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'node_modules', 'haxball.js', 'dist', 'index.cjs');

if (!fs.existsSync(SRC)) {
  console.error('❌ No se encontró node_modules/haxball.js');
  process.exit(1);
}

const src = fs.readFileSync(SRC, 'utf8');
console.log(`\n📦 haxball.js — ${(src.length / 1024).toFixed(1)} KB\n`);

// ── 1. setInterval ────────────────────────────────────────────────────────────
console.log('=== setInterval ===');
const intervals = [...src.matchAll(/setInterval\(function\(\)\{([^}]{1,60})\},(\d+)\)/g)];
intervals.forEach(m => console.log(`  ${m[2]}ms → ${m[1]}`));

// ── 2. setTimeout grandes ─────────────────────────────────────────────────────
console.log('\n=== setTimeout (valores fijos >= 1000ms) ===');
const timeouts = [...src.matchAll(/setTimeout\([^,]+,(\d{4,})\)/g)];
const uniqueMs = [...new Set(timeouts.map(m => m[1]))].sort((a,b) => a-b);
uniqueMs.forEach(ms => {
  const count = timeouts.filter(m => m[1] === ms).length;
  console.log(`  ${ms}ms × ${count} usos`);
});

// ── 3. Constantes numéricas en constructores (this.X = N) ─────────────────────
console.log('\n=== this.VAR = NUMBER (posibles parámetros tuneables) ===');
const thisNums = [...src.matchAll(/this\.([A-Za-z]{1,4})=(\d+(?:\.\d+)?(?:e\d+)?)/g)];
const seen = new Set();
thisNums.forEach(m => {
  const key = `${m[1]}=${m[2]}`;
  if (!seen.has(key)) {
    seen.add(key);
    console.log(`  this.${m[1]} = ${m[2]}`);
  }
});

// ── 4. console.log internos ───────────────────────────────────────────────────
console.log('\n=== console.log internos ===');
const logs = [...src.matchAll(/([A-Z])\.console\.log\(([^)]{0,50})\)/g)];
logs.forEach(m => console.log(`  ${m[0]}`));

// ── 5. Buffers grandes ────────────────────────────────────────────────────────
console.log('\n=== Buffers y allocations grandes ===');
const bufs = [...src.matchAll(/new (?:Uint8Array|ArrayBuffer|DataView)\((\d{3,})\)/g)];
bufs.forEach(m => console.log(`  new ${m[0].split('(')[0].replace('new ','')}(${m[1]}) = ${(m[1]/1024).toFixed(1)} KB`));

// ── 6. Constantes de red y protocolo ─────────────────────────────────────────
console.log('\n=== Constantes de red/protocolo ===');
// Max connections
const maxConn = [...src.matchAll(/(\d+)<=this\.xb\.size|this\.Ha\.length>=this\.([A-Za-z]+)/g)];
maxConn.forEach(m => console.log(`  ${m[0]}`));

// ── 7. URLs hardcodeadas ───────────────────────────────────────────────────────
console.log('\n=== URLs y endpoints ===');
const urls = [...src.matchAll(/["'](https?:\/\/[^"']{5,80})["']/g)];
urls.forEach(m => console.log(`  ${m[1]}`));

// ── 8. ICE servers ────────────────────────────────────────────────────────────
console.log('\n=== ICE/STUN servers ===');
const ice = [...src.matchAll(/urls:"([^"]+)"/g)];
ice.forEach(m => console.log(`  ${m[1]}`));

// ── 9. Límites de tamaño de mensajes ─────────────────────────────────────────
console.log('\n=== Límites de tamaño (string lengths) ===');
const limits = [...src.matchAll(/(\d+)<[A-Za-z$_]+\.(?:length|byteLength)/g)];
const uniqueLimits = [...new Set(limits.map(m => m[1]))].sort((a,b) => a-b);
uniqueLimits.forEach(l => {
  if (parseInt(l) > 5) console.log(`  limit: ${l}`);
});

// ── 10. Tick rate coefficient ─────────────────────────────────────────────────
console.log('\n=== Tick rate coefficient ===');
const ae = [...src.matchAll(/this\.[A-Za-z]{1,3}=0\.0[0-9]+/g)];
ae.forEach(m => console.log(`  ${m[0]}`));

// ── 11. Versión de protocolo ──────────────────────────────────────────────────
console.log('\n=== Versión de protocolo ===');
const ver = [...src.matchAll(/version:(\d+)/g)];
ver.forEach(m => console.log(`  version: ${m[1]}`));

// ── 12. Número de canales WebRTC ──────────────────────────────────────────────
console.log('\n=== Canales WebRTC ===');
const channels = [...src.matchAll(/\{name:"([^"]+)",reliable:([^,]+),ordered:([^}]+)\}/g)];
channels.forEach(m => console.log(`  name:${m[1]} reliable:${m[2]} ordered:${m[3]}`));

// ── 13. Delay de input y buffer ───────────────────────────────────────────────
console.log('\n=== Input/delay params ===');
const rb = [...src.matchAll(/this\.[A-Za-z]{1,3}=2(?=[,;])/g)];
rb.forEach(m => console.log(`  ${m[0]}`));

// ── 14. Rate limits ───────────────────────────────────────────────────────────
console.log('\n=== Rate limits ===');
const rl = [...src.matchAll(/pd:(\d+),xd:(\d+)/g)];
rl.forEach(m => console.log(`  pd:${m[1]} xd:${m[2]}  (max ${m[1]} per ${m[2]}ms)`));

console.log('\n✅ Análisis completo. Pegá este output en el chat.\n');
