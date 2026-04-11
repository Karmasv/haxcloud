// =============================================================================
//  stats.js — Estadísticas, XP y rangos
// =============================================================================

const AUTH_KEY_LENGTH = 43;

function getStats(auth) {
  try {
    const raw = localStorage.getItem(auth);
    return raw ? JSON.parse(raw) : new HaxStatistics();
  } catch { return new HaxStatistics(); }
}

function saveStats(auth, stats) {
  try { localStorage.setItem(auth, JSON.stringify(stats)); }
  catch (e) { console.error("Error guardando stats:", e); }
}

function calculateScore(wins, losses, goals, assists, cs) {
  return Math.max(0, 1000 + wins * 100 - losses * 100 + goals * 50 + assists * 40 + cs * 40);
}

function getPlayerScore(stats) {
  return calculateScore(stats.wins, stats.losses, stats.goals, stats.assists, stats.CS);
}

function getAllPlayerStats() {
  const result = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.length === AUTH_KEY_LENGTH) {
      try { result.push(JSON.parse(localStorage.getItem(key))); } catch {}
    }
  }
  return result;
}


// =============================================================================
//  SECCIÓN 9B: SISTEMA DE XP Y RANGOS
// =============================================================================

// XP ganada/perdida por evento
const XP = {
  victoria:   50,
  derrota:   -10,
  gol:        20,
  asistencia: 10,
  cleanSheet: 15,
  autogol:   -15,
};

// Rangos con XP mínima requerida
const RANGOS = [
  { nombre: "🥉 Bronce I",    xpMin: 0,     xpMax: 200  },
  { nombre: "🥉 Bronce II",   xpMin: 200,   xpMax: 350  },
  { nombre: "🥉 Bronce III",  xpMin: 350,   xpMax: 500  },
  { nombre: "🥈 Plata I",     xpMin: 500,   xpMax: 750  },
  { nombre: "🥈 Plata II",    xpMin: 750,   xpMax: 1000 },
  { nombre: "🥈 Plata III",   xpMin: 1000,  xpMax: 1500 },
  { nombre: "🥇 Oro I",       xpMin: 1500,  xpMax: 2200 },
  { nombre: "🥇 Oro II",      xpMin: 2200,  xpMax: 2900 },
  { nombre: "🥇 Oro III",     xpMin: 2900,  xpMax: 3500 },
  { nombre: "💎 Diamante I",  xpMin: 3500,  xpMax: 4500 },
  { nombre: "💎 Diamante II", xpMin: 4500,  xpMax: 5500 },
  { nombre: "💎 Diamante III",xpMin: 5500,  xpMax: 7000 },
  { nombre: "👑 Élite",       xpMin: 7000,  xpMax: Infinity },
];

function getRango(xp) {
  for (let i = RANGOS.length - 1; i >= 0; i--) {
    if (xp >= RANGOS[i].xpMin) return { ...RANGOS[i], index: i };
  }
  return { ...RANGOS[0], index: 0 };
}

function getNivel(xp) {
  return getRango(xp).index + 1;
}

function calcularXpPartido(comp, teamNum, winner) {
  let xpTotal = 0;
  if (winner === teamNum) xpTotal += XP.victoria;
  else if (winner !== 0)  xpTotal += XP.derrota;
  xpTotal += getGoalsPlayer(comp)     * XP.gol;
  xpTotal += getAssistsPlayer(comp)   * XP.asistencia;
  xpTotal += getCSPlayer(comp)        * XP.cleanSheet;
  xpTotal += getOwnGoalsPlayer(comp)  * XP.autogol;
  return xpTotal;
}

function updateXP(auth, xpGanada) {
  const stats   = getStats(auth);
  const xpAntes = stats.xp ?? 0;
  const xpDespues = Math.max(0, xpAntes + xpGanada);
  const rangoAntes   = getRango(xpAntes);
  const rangoDespues = getRango(xpDespues);
  stats.xp = xpDespues;
  saveStats(auth, stats);
  return { xpAntes, xpDespues, xpGanada, rangoAntes, rangoDespues, subioRango: rangoDespues.index > rangoAntes.index };
}

