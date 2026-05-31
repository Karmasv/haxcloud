// =============================================================================
//  utils.js — Utilidades generales
// =============================================================================

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTimeLong(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}

function getRandomInt(max) { return Math.floor(Math.random() * max); }

function splitMessage(text, maxLen = 1000) {
  if (text.length <= maxLen) return [text];
  const words = text.split(" ");
  const chunks = [];
  let curr = "";
  for (const word of words) {
    if ((curr + word).length <= maxLen) curr += (curr ? " " : "") + word;
    else { chunks.push(curr); curr = word; }
  }
  if (curr) chunks.push(curr);
  return chunks;
}

function getIdReport() {
  const d   = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${String(d.getFullYear() % 100)}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function getRecordingName(g) {
  const d   = new Date();
  const r1  = g.playerComp[0][0]?.player.name ?? "Red";
  const r2  = g.playerComp[1][0]?.player.name ?? "Blue";
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${String(d.getFullYear()%100)}-${pad(d.getHours())}h${pad(d.getMinutes())}-${r1}vs${r2}.hbr2`;
}

