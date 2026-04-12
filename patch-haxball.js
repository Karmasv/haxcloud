#!/usr/bin/env node
// =============================================================================
//  patch-haxball.js — Aplica optimizaciones al fuente de haxball.js
// =============================================================================

const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'node_modules', 'haxball.js', 'dist', 'index.cjs');
const DEST = path.join(__dirname, 'haxball.local.cjs');

if (!fs.existsSync(SRC)) {
  console.error('❌ No se encontró node_modules/haxball.js');
  process.exit(1);
}

console.log('📂 Leyendo haxball.js original...');
let src = fs.readFileSync(SRC, 'utf8');
const original = src;

let aplicados = 0;
let fallidos  = 0;

function patch(name, fn) {
  try {
    const antes = src;
    src = fn(src);
    if (src !== antes) {
      console.log('  ✅', name);
      aplicados++;
    } else {
      console.warn('  ⚠️ ', name, '— patrón no encontrado');
      fallidos++;
    }
  } catch(e) {
    console.error('  ❌', name, '— error:', e.message);
    fallidos++;
  }
}

// 1. Suprimir console.log internos
patch('Suprimir console.log interno', s =>
  s.replace(/F\.console\.log\(N\)/g, '(void 0)')
   .replace(/F\.console\.log\(\$\)/g, '(void 0)')
);

// 2. Tick interval 50ms → 100ms
patch('Tick interval 50ms → 100ms', s =>
  s.replace('setInterval(function(){E.Ca()},50)',
            'setInterval(function(){E.Ca()},100)')
);

// 3. Tick coefficient Ae 0.06 → 0.09 (compensa el interval mayor)
patch('Tick coefficient Ae 0.06 → 0.09', s =>
  s.replace('this.Ae=0.06', 'this.Ae=0.09')
);

// 4. Heartbeat 3000ms → 6000ms
patch('Heartbeat 3000ms → 6000ms', s =>
  s.replace('setInterval(function(){E.nc(U0.V(E))},3000)',
            'setInterval(function(){E.nc(U0.V(E))},6000)')
);

// 5. Snapshot interval 600 → 1200 ticks
patch('Snapshot interval 600 → 1200 ticks', s =>
  s.replace('this.Cg=600', 'this.Cg=1200')
);

// 6. Connection timeout 10000ms → 5000ms
patch('Connection timeout 10000ms → 5000ms', s =>
  s.replace('this.Rh=1e4', 'this.Rh=5e3')
);

// 7. Base reconnect delay 10000ms → 5000ms
patch('Base reconnect delay 10000ms → 5000ms', s =>
  s.replace('this.Th=1e4', 'this.Th=5e3')
);

// 8. Reconnect jitter 50000ms → 15000ms
patch('Reconnect jitter 50000ms → 15000ms', s =>
  s.replace('this.Uh=50000', 'this.Uh=15000')
);

// 9. Input delay Rb=2 → Rb=1
patch('Input delay Rb=2 → Rb=1', s =>
  s.replace('this.Rb=2', 'this.Rb=1')
);

// 10. WebRTC pending connections 16 → 32
patch('WebRTC pending limit 16 → 32', s =>
  s.replace('16<=this.xb.size', '32<=this.xb.size')
);

// ── Guardar ──────────────────────────────────────────────────────────────────
if (src === original) {
  console.error('\n❌ No se aplicó ningún cambio.');
  process.exit(1);
}

fs.writeFileSync(DEST, src, 'utf8');
const kb = (fs.statSync(DEST).size / 1024).toFixed(1);
console.log(`\n✅ haxball.local.cjs generado (${kb} KB)`);
console.log(`   Patches aplicados: ${aplicados}/10`);
if (fallidos > 0) console.warn(`   No encontrados:    ${fallidos}`);

// ── Actualizar manager.js ─────────────────────────────────────────────────────
const managerPath = path.join(__dirname, 'manager.js');
let manager = fs.readFileSync(managerPath, 'utf8');
if (manager.includes("require('haxball.js').default")) {
  manager = manager.replace("require('haxball.js').default", "require('./haxball.local.cjs').default");
  fs.writeFileSync(managerPath, manager, 'utf8');
  console.log('✅ manager.js actualizado para usar haxball.local.cjs');
} else {
  console.log('ℹ️  manager.js ya usa haxball.local.cjs');
}

console.log('\n🚀 Listo. Corré: node manager.js');