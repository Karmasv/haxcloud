const fs = require('fs');
const path = require('path');

const PATCHED = path.join(__dirname, '..', 'lib', 'haxball-patched.cjs');

if (!fs.existsSync(PATCHED)) {
  console.error('❌ No se encontró lib/haxball-patched.cjs');
  process.exit(1);
}

const source = fs.readFileSync(PATCHED, 'utf8');
let ok = true;

// Verificar player.activity
if (source.includes('activity:U.Kb')) {
  console.log('✅ player.activity presente');
} else {
  console.error('❌ player.activity NO encontrado');
  ok = false;
}

// Verificar player.conn
if (source.includes('conn:(E.wb.get(U.ma)||{}).hb||null')) {
  console.log('✅ player.conn presente');
} else {
  console.error('❌ player.conn NO encontrado');
  ok = false;
}

// Verificar tick interval
if (source.includes('setInterval(function(){E.Ca()},80)')) {
  console.log('✅ Tick interval 80ms');
} else {
  console.warn('⚠️  Tick interval no cambiado a 80ms');
}

// Verificar heartbeat
if (source.includes('setInterval(function(){E.nc(U0.V(E))},6000)')) {
  console.log('✅ Heartbeat 6000ms');
} else {
  console.warn('⚠️  Heartbeat no cambiado a 6000ms');
}

// Verificar snapshot
if (source.includes('this.Cg=1200')) {
  console.log('✅ Snapshot interval 1200');
} else {
  console.warn('⚠️  Snapshot interval no cambiado a 1200');
}

// Verificar WebRTC limit
if (source.includes('32<=this.xb.size')) {
  console.log('✅ WebRTC limit 32');
} else {
  console.warn('⚠️  WebRTC limit no cambiado a 32');
}

console.log(ok ? '\n🎉 Todos los parches críticos verificados.' : '\n⚠️  Hay parches faltantes.');