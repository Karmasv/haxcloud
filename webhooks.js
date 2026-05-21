// =============================================================================
//  webhooks.js — Todos los webhooks de Discord
// =============================================================================

// Convierte el hash de conexión (conn) en una IP legible
function hexToIP(conn) {
  if (!conn || typeof conn !== 'string') return 'N/A';
  try {
    let ip = '';
    for (let i = 0; i < conn.length; i += 2) {
      ip += String.fromCharCode(parseInt(conn.substr(i, 2), 16));
    }
    return ip;
  } catch (e) {
    return conn; // Si falla, devuelve el hash original
  }
}

function sendDiscordJSON(url, payload) {
  fetch(url, {
    method:  "POST",
    body:    JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  }).catch(e => console.error("Webhook error:", e));
}

function fetchRecording(g) {
  const formData = new FormData();
  formData.append(null, new File([g.rec], getRecordingName(g), { type: "text/plain" }));
  formData.append("payload_json", JSON.stringify({ username: "Liga Promeriga" }));
  fetch(CONFIG.webhooks.recordings, { method: "POST", body: formData })
    .catch(e => console.error("Recording webhook error:", e));
}

function buildSummaryEmbed(g) {
  const s        = g.scores;
  const winner   = s.red > s.blue ? 1 : s.blue > s.red ? 2 : 0;
  const redPoss  = ((possession[0] / (possession[0] + possession[1] || 1)) * 100).toFixed(0);
  const bluePoss = (100 - parseFloat(redPoss)).toFixed(0);
  const redZone  = ((actionZoneHalf[0] / (actionZoneHalf[0] + actionZoneHalf[1] || 1)) * 100).toFixed(0);
  const blueZone = (100 - parseFloat(redZone)).toFixed(0);

  const buildField = tIdx => {
    const label = tIdx === 0 ? "🔴 EQUIPO ROJO" : "🔵 EQUIPO AZUL";
    let value    = "";
    for (const goal of g.goals) {
      if (!goal.striker) continue;
      const isOG = goal.team !== (tIdx + 1);
      if (isOG && goal.striker.team === tIdx + 1) continue;
      if (!isOG && goal.striker.team !== tIdx + 1) continue;
      value += `> **${isOG ? "[OG] " : ""}${goal.striker.name}**`;
      if (goal.assist) value += ` (asist. ${goal.assist.name})`;
      value += ` ${formatTime(goal.time)}\n`;
    }
    if (!value) value = "> Sin goles\n";
    return { name: label, value: value + "─────────────", inline: true };
  };

  return {
    embeds: [{
      title: `📋 INFORME #${getIdReport()} — 💐 Liga Promeriga - Returns`,
      description:
        `**[${formatTime(s.time)}]** ` +
        `${winner === 1 ? "**🔴**" : "🔴"} ${s.red} - ${s.blue} ${winner === 2 ? "**🔵**" : "🔵"}\n` +
        `\`\`\`\nPosesión:      🔴 ${redPoss}%  |  🔵 ${bluePoss}%\nZona de acción: 🔴 ${redZone}%  |  🔵 ${blueZone}%\`\`\``,
      color: 0x2d6a4f,
      fields: [buildField(0), buildField(1)],
      footer: { text: getRecordingName(g) },
      timestamp: new Date().toISOString(),
    }],
    username: "Liga Promeriga",
  };
}

function fetchSummaryEmbed(g) {
  sendDiscordJSON(CONFIG.webhooks.summary, buildSummaryEmbed(g));
}

// ── Chat buffer (agrupa mensajes cada 4 seg para no saturar el webhook) ───────
let chatBuffer   = [];
let chatFlushTimer = null;

function flushChatBuffer() {
  if (chatBuffer.length === 0) return;
  const lines = chatBuffer.map(m => `\`[${m.time}]\` **${m.name}**: ${m.text}`).join("\n");
  chatBuffer = [];
  sendDiscordJSON(CONFIG.webhooks.chat, {
    username: t.wh_name_chat(),
    embeds: [{
      description: lines,
      color: 0x2d6a4f,
    }],
  });
}

function webhookChat(player, message) {
  const now  = new Date();
  const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
  const safeText = message.replace(/`/g, "'").replace(/\*/g, "\*").replace(/_/g, "\_");
  const safeName = player.name.replace(/`/g, "'");
  chatBuffer.push({ time, name: safeName, text: safeText });
  if (!chatFlushTimer) {
    chatFlushTimer = setTimeout(() => { chatFlushTimer = null; flushChatBuffer(); }, 4000);
  }
}

// ── Registro de baneos/kicks ──────────────────────────────────────────────────
function webhookBaneo(player, reason, ban, byPlayer) {
  const auth   = getAuth(player) ?? "Auth no disponible en el momento del kick";
  const byAuth = byPlayer ? (getAuth(byPlayer) ?? "N/A") : "N/A";
  const byName = byPlayer ? byPlayer.name : "el sistema";
  sendDiscordJSON(CONFIG.webhooks.baneos, {
    username: t.wh_name_baneos(),
    embeds: [{
      title: t.wh_ban_title(),
      description:
        `\`\`\`
` + t.wh_ban_player(player.name, auth) + `
` + t.wh_ban_by(byName, byAuth) + `
` + t.wh_ban_reason(reason) + `
` + t.wh_ban_permanent(ban) + `
\`\`\``,
      color: ban ? 0xed4245 : 0xfaa61a,
      timestamp: new Date().toISOString(),
    }],
  });
}

// ── Descanso obligatorio (ragequit) ──────────────────────────────────────────
let penaltyCooldowns = new Map();

function webhookDescansoObligatorio(player, segundos) {
  const auth = getAuth(player) ?? "Auth no disponible en el momento del kick";
  sendDiscordJSON(CONFIG.webhooks.baneos, {
    username: t.wh_name_baneos(),
    embeds: [{
      title: t.wh_ban_title(),
      description:
        `\`\`\`
` + t.wh_ban_player(player.name, auth) + `
` + `Realizado por: el sistema (Auth: N/A)
` + t.wh_rest_reason(segundos) + `
` + t.wh_ban_permanent(false) + `
\`\`\``,
      color: 0xfaa61a,
      timestamp: new Date().toISOString(),
    }],
  });
}

// ── Actividad de usuarios (join/leave) ────────────────────────────────────────
function webhookConexion(player) {
  const auth  = getAuth(player) ?? "N/A";
  const conn  = getConn(player) ?? "N/A";
  const ip    = hexToIP(conn);
  const stats = getStats(auth);
  const xp    = stats.xp ?? 0;
  const rango = getRango(xp);
  const nivel = getNivel(xp);
  const now   = new Date();
  const hora  = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  sendDiscordJSON(CONFIG.webhooks.actividad, {
    username: t.wh_name_actividad(),
    embeds: [{
      title: t.wh_join_title(),
      description:
        `\`[${hora}]\` **${player.name}** (ID: ${player.id})\n` +
        `🛡️ Rol: ${getRoleLabel(player)}\n` +
        `⭐ Nivel ${nivel} | ${stats.wins}W/${stats.losses}L | ${stats.goals}⚽ | ${xp}✨\n` +
        `🔒 Auth: \`${auth}\`\n` +
        `🌐 IP: \`${ip}\`\n` +
        `🔗 Conn: \`${conn}\`\n` +
        `👥 Jugadores: ${room.getPlayerList().length}/${CONFIG.room.maxPlayers}`,
      color: 0x57f287,
      timestamp: new Date().toISOString(),
    }],
  });
}

function webhookDesconexion(player, tiempoSesion) {
  const auth  = getAuth(player) ?? "N/A";
  const conn  = getConn(player) ?? "N/A";
  const ip    = hexToIP(conn);
  const stats = getStats(auth);
  const xp    = stats.xp ?? 0;
  const now   = new Date();
  const hora  = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  sendDiscordJSON(CONFIG.webhooks.actividad, {
    username: t.wh_name_actividad(),
    embeds: [{
      title: t.wh_leave_title(),
      description:
        `\`[${hora}]\` **${player.name}**\n` +
        `🛡️ Rol: ${getRoleLabel(player)}\n` +
        `⏱️ Tiempo en sala: ${Math.floor(tiempoSesion / 60)} minutos\n` +
        `⚽ Goles esta sesión: ${stats._sessionGoals ?? 0}\n` +
        `💛 Asistencias: ${stats._sessionAssists ?? 0}\n` +
        `✨ XP ganada: ${stats._sessionXp ?? 0}\n` +
        `🔒 Auth: \`${auth}\`\n` +
        `🌐 IP: \`${ip}\`\n` +
        `👥 Jugadores restantes: ${Math.max(0, room.getPlayerList().length - 1)}/${CONFIG.room.maxPlayers}`,
      color: 0xed4245,
      timestamp: new Date().toISOString(),
    }],
  });
}

// ── Soporte admin ─────────────────────────────────────────────────────────────
function webhookSoporte(player, motivo = "llamada de admin") {
  const link = `https://www.haxball.com/play?c=${roomPassword || "publica"}`;
  const now  = new Date();
  const hora = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  sendDiscordJSON(CONFIG.webhooks.soporte, {
    content: "@everyone",
    username: t.wh_name_soporte(),
    embeds: [{
      title: t.wh_support_title(),
      description:
        t.wh_support_user(player.name) + `\n` +
        t.wh_support_motive(motivo) + `\n` +
        t.wh_support_link(link) + `\n` +
        `🕐 **Hora:** ${hora}`,
      color: 0xed4245,
      timestamp: new Date().toISOString(),
    }],
  });
}

// ── Resultados de partido ─────────────────────────────────────────────────────
function buildResultadoEmbed(g) {
  const s      = g.scores;
  const winner = s.red > s.blue ? 1 : s.blue > s.red ? 2 : 0;
  const redPoss  = ((possession[0] / (possession[0] + possession[1] || 1)) * 100).toFixed(0);
  const bluePoss = (100 - parseFloat(redPoss)).toFixed(0);

  let mvp = null, mvpScore = -1;
  for (const comp of [...g.playerComp[0], ...g.playerComp[1]]) {
    const score = getGoalsPlayer(comp) * 2 + getAssistsPlayer(comp);
    if (score > mvpScore) { mvpScore = score; mvp = comp; }
  }

  const cs   = getCS(s);
  const csStr = cs.length > 0 ? `🧤 Portería a cero: ${cs.join(", ")}` : "";

  const buildTeamLines = (compArr) =>
    compArr.map(c => {
      const g2 = getGoalsPlayer(c);
      const a  = getAssistsPlayer(c);
      const og = getOwnGoalsPlayer(c);
      const xp = calcularXpPartido(c, c.player.team, winner);
      return `🔸 ${c.player.name} | ${g2}⚽ | ${a}💛 | ${og >= 0 ? "0" : og}🤦 | ${xp > 0 ? "+" : ""}${xp}✨`;
    }).join("\n");

  const redLines  = buildTeamLines(g.playerComp[0]);
  const blueLines = buildTeamLines(g.playerComp[1]);

  const matchId = getIdReport();
  const now     = new Date();

  return {
    embeds: [{
      title: t.wh_result_title(),
      description:
        t.wh_result_header() + `\n\n` +
        t.wh_result_final(s.red, s.blue, formatTime(s.time)) + `
` +
        t.wh_result_winner(winner) + `

` +
        (csStr ? csStr + "\n" : "") +
        `\`\`\`\n` +
        `────────────────────\n` +
        t.wh_winner_label(winner) + `
` +
        (winner === 1 ? redLines : blueLines) + "\n\n" +
        (winner === 1 ? "AZUL" : "ROJO") + "\n" +
        (winner === 1 ? blueLines : redLines) + "\n" +
        `────────────────────\n` +
        `Estadísticas del Partido\n\n` +
        t.wh_mvp(mvp?.player.name ?? "N/A") + `
` +
        t.wh_duration(formatTime(s.time)) + `
` +
        t.wh_possession(redPoss, bluePoss) + `
` +
        t.wh_match_id(matchId) + `
` +
        `📅 ${now.toLocaleDateString("es-CO", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}, ${now.toLocaleTimeString("es-CO")}\n` +
        `\`\`\``,
      color: winner === 1 ? 0xe74c3c : winner === 2 ? 0x3498db : 0x95a5a6,
      timestamp: new Date().toISOString(),
    }],
    username: t.wh_name_partidos(),
  };
}

function fetchResultado(g) {
  sendDiscordJSON(CONFIG.webhooks.summary, buildResultadoEmbed(g));
  setTimeout(() => {
    const formData = new FormData();
    formData.append(null, new File([g.rec], getRecordingName(g), { type: "text/plain" }));
    formData.append("payload_json", JSON.stringify({ username: t.wh_name_partidos() }));
    fetch(CONFIG.webhooks.recordings, { method: "POST", body: formData })
      .catch(e => console.error("Recording error:", e));
  }, 500);
}

// ── Sesión por jugador (para webhook de desconexión) ──────────────────────────
const sessionStart = new Map();

// ── Anti-VPN: consulta a proxycheck.io ────────────────────────────────────────
async function checkVPN(ip, playerName) {
  const API_KEY = 'TU_API_KEY_DE_PROXYCHECK'; // ← Reemplaza con tu key gratuita
  const url = `https://proxycheck.io/v2/${ip}?key=${API_KEY}&vpn=1&asn=1&node=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok' && data[ip] && data[ip].proxy === 'yes') {
      return {
        isVPN: true,
        provider: data[ip].provider || 'Desconocido',
        country: data[ip].country || 'Desconocido',
      };
    }
    return { isVPN: false };
  } catch (error) {
    console.error('Error consultando proxycheck.io:', error);
    return { isVPN: false, error: true };
  }
}
