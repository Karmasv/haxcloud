// =============================================================================
//  commands.js — Todos los comandos de la sala
// =============================================================================

function announce(text, playerId, color, style, sound) {
  room.sendAnnouncement(text, playerId ?? null, color ?? null, style ?? "normal", sound ?? 0);
}

function announceAll(text, color, style, sound) {
  room.sendAnnouncement(text, null, color, style ?? "normal", sound ?? 0);
}

function sendAnnouncementTeam(text, teamPlayers, color, style, sound) {
  for (const p of teamPlayers) room.sendAnnouncement(text, p.id, color, style, sound);
}

function teamChat(player, message) {
  const words = message.split(/ +/).slice(1).join(" ");
  const emoji = player.team === 1 ? "🔴" : player.team === 2 ? "🔵" : "⚪";
  const color = player.team === 1 ? 0xff4c4c : player.team === 2 ? 0x62cbff : null;
  sendAnnouncementTeam(`${emoji} [TEAM] ${player.name}: ${words}`, getTeamArray(player.team, true), color, "bold", 1);
}

function playerChat(player, message) {
  const parts  = message.split(/ +/);
  const target = playersAll.find(p => p.name.replaceAll(" ", "_") === parts[0].substring(2));
  if (!target) { announce("❌ Jugador no válido", player.id, 0xed5050, "bold", 1); return; }
  if (target.id === player.id) { announce("❌ No puedes enviarte mensajes a ti mismo.", player.id, 0xed5050, "bold", 1); return; }
  const body = parts.slice(1).join(" ");
  announce(`💌 [Tú → ${target.name}] ${body}`,   player.id, 0xffc933, "bold", 1);
  announce(`💌 [${player.name} → Tú] ${body}`, target.id, 0xffc933, "bold", 1);
}

function printRankings(stat, playerId = null) {
  const all    = getAllPlayerStats();
  const sorted = all
    .map(s => ({
      name:  s.playerName,
      value: stat === "elo"      ? getPlayerScore(s)
           : stat === "playtime" ? s.playtime
           : s[stat === "cs" ? "CS" : stat] ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  if (sorted.length < 5) {
    if (playerId) announce("¡Aún no hay suficientes partidos registrados!", playerId, 0xed5050, "bold", 1);
    return;
  }

  const icons  = { elo: "💎", goals: "⚽", assists: "⭐", wins: "🏆", losses: "😵", cs: "🧤", playtime: "⏱️" };
  const icon   = icons[stat] ?? "💐";
  const header = `━━━━━━━  ${icon} TOP 5  ${icon}  ━━━━━━━`;
  const footer = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  const colors = [0x52b788, 0x40916c, 0x2d6a4f, 0x1b4332, 0x081c15];

  announce(header, playerId, 0x74c69d, "bold", 0);
  for (let i = 0; i < 5; i++) {
    const e   = sorted[i];
    const val = stat === "elo"      ? Math.floor(e.value)
              : stat === "playtime" ? formatTimeLong(e.value)
              : e.value;
    announce(`  ${i+1}. ${e.name}: ${val}${i === 0 ? " 👑" : ""}`, playerId, colors[i], "bold", 0);
  }
  announce(footer, playerId, 0x74c69d, "normal", 0);
}

function announceWinProbability() {
  const build = team => {
    let elo = 0, wr = 0, g = 0, a = 0, played = 0;
    for (const p of team) {
      const auth = getAuth(p);
      if (!auth) continue;
      const s = getStats(auth);
      elo    += getPlayerScore(s);
      wr     += parseFloat(s.winrate) || 0;
      g      += s.goals;
      a      += s.assists;
      played += s.games;
    }
    const n = team.length || 1;
    return { elo: elo/n, wr: wr/n, g, a, played };
  };
  const r  = build(teamRed);
  const b  = build(teamBlue);
  const rs = r.elo*0.4 + r.wr*0.3 + (r.g/(r.played||1))*20 + (r.a/(r.played||1))*10;
  const bs = b.elo*0.4 + b.wr*0.3 + (b.g/(b.played||1))*20 + (b.a/(b.played||1))*10;
  const total = rs + bs || 1;
  announceAll("⚔️ Probabilidades de victoria:", 0x2d6a4f, "bold", 0);
  announceAll(`🔴 RED: ${((rs/total)*100).toFixed(1)}%  |  🔵 BLUE: ${((bs/total)*100).toFixed(1)}%`, 0x52b788, "bold", 0);
}


function helpCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  const role = getRole(player);
  if (args.length === 0) {
    let msg = "📖 Comandos disponibles:\n";
    for (const [key, cmd] of Object.entries(commands)) {
      if (cmd.desc && cmd.minRole === 0) msg += ` !${key},`;
    }
    msg = msg.slice(0, -1) + ".\n";
    if (role >= 1) {
      let vipMsg = "💎 VIP:";
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 1) vipMsg += ` !${key},`;
      }
      if (!vipMsg.endsWith(":")) msg += vipMsg.slice(0, -1) + ".\n";
    }
    if (role >= 2) {
      let modMsg = "🛡️ Mod:";
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 2) modMsg += ` !${key},`;
      }
      if (!modMsg.endsWith(":")) msg += modMsg.slice(0, -1) + ".\n";
    }
    if (role >= 3) {
      let adminMsg = "🌟 Admin:";
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 3) adminMsg += ` !${key},`;
      }
      if (!adminMsg.endsWith(":")) msg += adminMsg.slice(0, -1) + ".\n";
    }
    if (role >= 4) {
      let ownerMsg = "👑 Owner:";
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 4) ownerMsg += ` !${key},`;
      }
      if (!ownerMsg.endsWith(":")) msg += ownerMsg.slice(0, -1) + ".\n";
    }
    msg += "\n💡 Usa '!help <comando>' para más detalles.";
    announce(msg, player.id, 0xe2e2e2, "bold", 1);
  } else {
    const key = getCommand(args[0].toLowerCase());
    if (key && commands[key].desc) {
      announce(`📖 !${key}: ${commands[key].desc}`, player.id, 0xe2e2e2, "bold", 1);
    }
  }
}

function statsCommand(player) {
  const auth  = getAuth(player);
  const stats = getStats(auth);
  const score = getPlayerScore(stats);
  announce(
    `📋 ${player.name} — Partidos: ${stats.games} | 🏆 ${stats.wins}W 😵 ${stats.losses}L | 📊 ${stats.winrate}\n` +
    `⚽ ${stats.goals}G ⭐ ${stats.assists}A 🧤 ${stats.CS}CS 🐸 ${stats.ownGoals}OG | 💎 Score: ${score} | ⏱️ ${formatTimeLong(stats.playtime)}`,
    player.id, 0xe2e2e2, "bold", 0
  );
}

function showStatsCommand(player) {
  const auth  = getAuth(player);
  const stats = getStats(auth);
  const score = getPlayerScore(stats);
  announceAll(`🏆 ${player.name} comparte sus stats:`, 0x52b788, "bold", 0);
  announceAll(
    `📋 Partidos: ${stats.games} | 🏆 ${stats.wins}W 😵 ${stats.losses}L | 📊 ${stats.winrate}\n` +
    `⚽ ${stats.goals}G ⭐ ${stats.assists}A 🧤 ${stats.CS}CS | 💎 Score: ${score} | ⏱️ ${formatTimeLong(stats.playtime)}`,
    0xe2e2e2, "bold", 0
  );
}

function resetStatsCommand(player) {
  const auth = getAuth(player);
  localStorage.removeItem(auth);
  announce("✅ Tus estadísticas fueron reseteadas.", player.id, 0xffefd6, "bold", 1);
}

function afkCommand(player) {
  if (player.team === 0) { announce("¡Ya sos espectador!", player.id, 0xed5050, "bold", 1); return; }
  if (AFKSet.has(player.id)) { announce("¡Ya estás AFK!", player.id, 0xed5050, "bold", 1); return; }
  AFKSet.add(player.id);
  room.setPlayerTeam(player.id, 0);
  announceAll(`😴 ${player.name} se fue AFK.`, 0xffefd6, "bold", 1);
  updateTeams();
  handlePlayersLeave();
}

function subCommand(player) {
  const now    = Date.now();
  const scores = room.getScores();
  if (scores && ((player.team === 1 && scores.red < scores.blue) || (player.team === 2 && scores.blue < scores.red))) {
    announce("¡No puedes irte AFK mientras tu equipo va perdiendo!", player.id, 0xed5050, "bold", 1);
    return;
  }
  if (AFKSet.has(player.id)) {
    if (AFKMinSet.has(player.id)) { announce("⏱️ Debes esperar antes de usar !sub de nuevo.", player.id, 0xffa135, "bold", 1); }
    else {
      AFKSet.delete(player.id);
      announceAll(`✅ ${player.name} volvió.`, 0xffefd6, "normal", 1);
      updateTeams(); handlePlayersJoin();
    }
    return;
  }
  if (afkCooldownTimes.has(player.id)) {
    const remaining = (CONFIG.cooldowns.sub - (now - afkCooldownTimes.get(player.id))) / 1000;
    if (remaining > 0) {
      announce(`⏱️ Cooldown: ${Math.floor(remaining/60)}m ${Math.floor(remaining%60)}s`, player.id, 0xffa135, "bold", 1);
      return;
    }
  }
  AFKSet.add(player.id);
  if (!player.admin) {
    AFKMinSet.add(player.id);
    afkCooldownTimes.set(player.id, now);
    setTimeout(() => AFKMinSet.delete(player.id), 0);
    setTimeout(() => AFKSet.delete(player.id), CONFIG.cooldowns.afk);
    setTimeout(() => afkCooldownTimes.delete(player.id), CONFIG.cooldowns.sub);
  }
  room.setPlayerTeam(player.id, 0);
  announceAll(`😴 ${player.name} se fue AFK.`, 0xffefd6, "bold", 1);
  updateTeams(); handlePlayersLeave();
}

function afkListCommand(player) {
  if (AFKSet.size === 0) { announce("😴 No hay nadie AFK.", player.id, 0xffefd6, "bold", null); return; }
  let msg = "😴 AFK: ";
  AFKSet.forEach(id => { const p = room.getPlayer(id); if (p) msg += p.name + ", "; });
  announce(msg.slice(0, -2) + ".", player.id, 0xffefd6, "bold", null);
}

function leaveCommand(player) {
  room.kickPlayer(player.id, "👋 ¡Hasta luego!", false);
}

function avatarCommand(player) {
  if (avatarEnabled.has(player.id)) {
    avatarEnabled.delete(player.id);
    prevPositions.delete(player.id);
    room.setPlayerAvatar(player.id, null);
    announce("🔃 Indicadores de movimiento desactivados.", player.id, 0xffefd6, "bold", 1);
  } else {
    avatarEnabled.add(player.id);
    const disc = room.getPlayerDiscProperties(player.id);
    if (disc) prevPositions.set(player.id, { x: disc.x, y: disc.y });
    announce("🔃 Indicadores de movimiento activados.", player.id, 0xffefd6, "bold", 1);
  }
}

function discordCommand(player) {
  announce("💐 LIGA PROMERIGA - RETURNS", player.id, 0x2d6a4f, "bold",   0);
  announce("Servidor oficial de Discord:",  player.id, 0x52b788, "normal", 0);
  announce(CONFIG.discord,                  player.id, 0x52b788, "bold",   0);
}

function jumpCommand(player) {
  if (gameState !== 0 || playSituation !== 2) {
    announce("¡Solo podés saltar durante un partido activo!", player.id, 0xed5050, "bold", 1);
    return;
  }
  if (player.team !== 0) {
    announce("¡Debes ser espectador para saltar la fila!", player.id, 0xed5050, "bold", 1);
    return;
  }
  const auth   = getAuth(player);
  const role   = getRole(player);
  if (role < 1) {
    announce("💎 Comando exclusivo para VIP y superiores.", player.id, 0xe2e2e2, "bold", 1);
    return;
  }
  const now      = Date.now();
  const cooldown = role >= 2 ? CONFIG.cooldowns.jumpMod : CONFIG.cooldowns.jumpVip;
  if (jumpCooldowns.has(auth)) {
    const remaining = (jumpCooldowns.get(auth) + cooldown - now) / 1000;
    if (remaining > 0) {
      announce(`⏱️ Cooldown: ${Math.floor(remaining/60)}m ${Math.floor(remaining%60)}s`, player.id, 0xffa135, "bold", 1);
      return;
    }
  }
  const specs = room.getPlayerList().filter(p => p.team === 0 && p.id !== player.id);
  room.reorderPlayers([player.id, ...specs.map(p => p.id)], true);
  jumpCooldowns.set(auth, now);
  announceAll(`💎 ¡${player.name} pasó al primer lugar de la fila!`, 0xffefd6, "bold", 1);
}

function anonCommand(player, message) {
  const now  = Date.now();
  if (anonCooldownTimes.has(player.id)) {
    const remaining = (CONFIG.cooldowns.anonMsg - (now - anonCooldownTimes.get(player.id))) / 1000;
    if (remaining > 0) {
      announce(`⏱️ Cooldown: ${Math.floor(remaining/60)}m ${Math.floor(remaining%60)}s`, player.id, 0xffa135, "bold", 1);
      return;
    }
  }
  const text = message.split(/ +/).slice(1).join(" ");
  if (!text) { announce("❌ Escribe un mensaje después de !anon.", player.id, 0xed5050, "bold", 1); return; }
  anonCooldownTimes.set(player.id, now);
  setTimeout(() => anonCooldownTimes.delete(player.id), CONFIG.cooldowns.anonMsg);
  announceAll(`👻 Anónimo: ${text}`, 0xe2e2e2, "normal", 0);
}

function votekickCommand(player, message) {
  if (voteKickData.active) { announce("¡Ya hay una votación activa!", player.id, 0xed5050, "bold", 1); return; }
  const idStr = message.split(/ +/)[1];
  if (!idStr?.startsWith("#")) { announce("❌ Uso: !votekick #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(idStr.slice(1)));
  if (!target || target.id === player.id) { announce("¡Jugador inválido!", player.id, 0xed5050, "bold", 1); return; }
  if (getRole(target) >= 2) { announce("¡No podés votar para expulsar a un Mod o superior!", player.id, 0xed5050, "bold", 1); return; }
  voteKickData.active        = true;
  voteKickData.target        = target;
  voteKickData.initiator     = player;
  voteKickData.votes         = 1;
  voteKickData.voters        = new Set([player.id]);
  voteKickData.requiredVotes = Math.ceil(players.length * 0.6);
  announceAll(
    `🗳️ ${player.name} inició votación para expulsar a ${target.name}.\nEscribí '!vote' para votar. (${voteKickData.votes}/${voteKickData.requiredVotes})`,
    0xffa135, "bold", 1
  );
  voteKickData.timeout = setTimeout(() => {
    announceAll(`🗳️ Votación para expulsar a ${voteKickData.target?.name} expiró.`, 0xe2e2e2, "normal", 0);
    voteKickData.active = false; voteKickData.target = null;
  }, 60_000);
}

function voteCommand(player) {
  if (!voteKickData.active) { announce("¡No hay ninguna votación activa!", player.id, 0xed5050, "bold", 1); return; }
  if (voteKickData.voters.has(player.id)) { announce("¡Ya votaste!", player.id, 0xed5050, "bold", 1); return; }
  voteKickData.votes++;
  voteKickData.voters.add(player.id);
  if (voteKickData.votes >= voteKickData.requiredVotes) {
    clearTimeout(voteKickData.timeout);
    room.kickPlayer(voteKickData.target.id, "Expulsado por votación.", false);
    announceAll(`✅ ${voteKickData.target.name} fue expulsado por votación.`, 0xffefd6, "bold", 1);
    voteKickData.active = false; voteKickData.target = null;
  } else {
    announceAll(`🗳️ ${player.name} votó. (${voteKickData.votes}/${voteKickData.requiredVotes})`, 0xffa135, "normal", 0);
  }
}

function callAdminCommand(player, message) {
  const motivo = message.split(/ +/).slice(1).join(" ") || "llamada de admin";
  announceAll(`🆘 ${player.name} necesita un administrador.`, 0xed5050, "bold", 1);
  webhookSoporte(player, motivo);
}

function renameCommand(player, message) {
  const auth    = getAuth(player);
  const newName = message.split(/ +/).slice(1).join(" ");
  if (!newName) { announce("❌ Escribe el nuevo nombre después del comando.", player.id, 0xed5050, "bold", 1); return; }
  const stats = getStats(auth);
  stats.playerName = newName;
  saveStats(auth, stats);
  announce(`✅ Nombre en estadísticas cambiado a: ${newName}`, player.id, 0xffefd6, "bold", 1);
}


function claimAdminCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  if (args[0] !== CONFIG.claimPassword) {
    announce("❌ Contraseña incorrecta.", player.id, 0xed5050, "bold", 1);
    return;
  }
  const auth = getAuth(player);
  if (ownerList.some(o => o[0] === auth)) {
    // Ya es owner, simplemente reactivar admin de sala
    room.setPlayerAdmin(player.id, true);
    announce("✅ Admin de sala reactivado.", player.id, 0xffefd6, "bold", 1);
    return;
  }
  ownerList.push([auth, player.name]);
  room.setPlayerAdmin(player.id, true);
  announceAll(`👑 ${player.name} es ahora Owner de la sala.`, 0xffefd6, "bold", 1);
}

function muteCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  if (!args[0]?.startsWith("#")) { announce("❌ Uso: !mute #ID [minutos]", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(args[0].slice(1)));
  if (!target) { announce("¡Jugador no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  if (getRole(target) >= getRole(player)) { announce("¡No podés mutear a alguien de tu rango o superior!", player.id, 0xed5050, "bold", 1); return; }
  if (muteArray.getByPlayerId(target.id)) { announce("¡El jugador ya está muteado!", player.id, 0xed5050, "bold", 1); return; }
  const minutes = parseInt(args[1]) || 5;
  const mp      = new MutePlayer(target.name, target.id, getAuth(target));
  mp.setDuration(minutes);
  announceAll(`🔇 ${target.name} fue muteado por ${minutes} minutos.`, 0xffefd6, "bold", 1);
}

function unmuteCommand(player, message) {
  const arg = message.split(/ +/)[1];
  if (!arg) { announce("❌ Uso: !unmute #ID", player.id, 0xed5050, "bold", 1); return; }
  const mp = arg.startsWith("#")
    ? muteArray.getByPlayerId(parseInt(arg.slice(1)))
    : muteArray.getById(parseInt(arg));
  if (!mp) { announce("¡Jugador no encontrado en la lista de muteados!", player.id, 0xed5050, "bold", 1); return; }
  mp.remove();
  announceAll(`🔊 ${mp.name} fue desmuteado.`, 0xffefd6, "bold", 1);
}

function muteListCommand(player) {
  if (muteArray.list.length === 0) { announce("🔇 No hay nadie muteado.", player.id, 0xffefd6, "bold", null); return; }
  let msg = "🔇 Muteados: ";
  for (const mp of muteArray.list) msg += `${mp.name}[${mp.id}], `;
  announce(msg.slice(0, -2) + ".", player.id, 0xffefd6, "bold", null);
}

function setVipCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !setvip #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce("¡Jugador no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  if (vipList.some(v => v[0] === auth)) { announce("¡El jugador ya es VIP!", player.id, 0xed5050, "bold", 1); return; }
  vipList.push([auth, target.name]);
  announceAll(`💎 ¡${target.name} ahora es VIP de Liga Promeriga!`, 0xffefd6, "bold", 1);
}

function removeVipCommand(player, message) {
  const arg = message.split(/ +/)[1];
  if (!arg) { announce("❌ Uso: !removevip #ID", player.id, 0xed5050, "bold", 1); return; }
  let idx = -1;
  if (arg.startsWith("#")) {
    const target = room.getPlayer(parseInt(arg.slice(1)));
    if (target) idx = vipList.findIndex(v => v[0] === getAuth(target));
  } else {
    idx = parseInt(arg);
  }
  if (idx < 0 || idx >= vipList.length) { announce("¡VIP no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  const name = vipList[idx][1];
  vipList.splice(idx, 1);
  announceAll(`💎 ${name} ya no es VIP.`, 0xffefd6, "bold", 1);
}

function vipListCommand(player) {
  if (vipList.length === 0) { announce("💎 No hay jugadores VIP.", player.id, 0xffefd6, "bold", null); return; }
  let msg = "💎 VIPs: ";
  vipList.forEach((v, i) => msg += `${v[1]}[${i}], `);
  announce(msg.slice(0, -2) + ".", player.id, 0xffefd6, "bold", null);
}

function setModCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !setmod #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce("¡Jugador no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  if (modList.some(m => m[0] === auth)) { announce("¡El jugador ya es Mod!", player.id, 0xed5050, "bold", 1); return; }
  modList.push([auth, target.name]);
  room.setPlayerAdmin(target.id, true);
  announceAll(`🛡️ ${target.name} ahora es Moderador.`, 0xffefd6, "bold", 1);
}

function removeModCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !removemod #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce("¡Jugador no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  modList = modList.filter(m => m[0] !== auth);
  room.setPlayerAdmin(target.id, false);
  announceAll(`🛡️ ${target.name} ya no es Moderador.`, 0xffefd6, "bold", 1);
}

function setAdminCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !setadmin #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce("¡Jugador no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  if (adminList.some(a => a[0] === auth)) { announce("¡El jugador ya es Admin!", player.id, 0xed5050, "bold", 1); return; }
  adminList.push([auth, target.name]);
  room.setPlayerAdmin(target.id, true);
  announceAll(`🌟 ${target.name} ahora es Administrador.`, 0xffefd6, "bold", 1);
}

function removeAdminCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !removeadmin #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce("¡Jugador no encontrado!", player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  adminList = adminList.filter(a => a[0] !== auth);
  room.setPlayerAdmin(target.id, false);
  announceAll(`🌟 ${target.name} ya no es Administrador.`, 0xffefd6, "bold", 1);
}

function adminListCommand(player) {
  const lines = [];
  if (ownerList.length)  lines.push("👑 Owners: "  + ownerList.map(o => o[1]).join(", "));
  if (adminList.length)  lines.push("🌟 Admins: "  + adminList.map(a => a[1]).join(", "));
  if (modList.length)    lines.push("🛡️ Mods: "    + modList.map(m => m[1]).join(", "));
  if (lines.length === 0) { announce("No hay staff registrado.", player.id, 0xffefd6, "bold", null); return; }
  announce(lines.join("\n"), player.id, 0xffefd6, "bold", null);
}

function clearbansCommand(player, message) {
  const arg = message.split(/ +/)[1];
  if (!arg) {
    room.clearBans();
    banList = [];
    announceAll("✅ Todos los baneos removidos.", 0xffefd6, "bold", null);
  } else {
    const idx = parseInt(arg);
    if (isNaN(idx) || idx < 0 || idx >= banList.length) { announce("¡Número inválido!", player.id, 0xed5050, "bold", 1); return; }
    room.clearBan(banList[idx][1]);
    const name = banList[idx][0];
    banList.splice(idx, 1);
    announceAll(`✅ ${name} fue desbaneado.`, 0xffefd6, "bold", null);
  }
}

function banListCommand(player) {
  if (banList.length === 0) { announce("🔨 No hay nadie baneado.", player.id, 0xffefd6, "bold", null); return; }
  let msg = "🔨 Baneados: ";
  banList.forEach((b, i) => msg += `${b[0]}[${i}], `);
  announce(msg.slice(0, -2) + ".", player.id, 0xffefd6, "bold", null);
}

function passwordCommand(player, message) {
  const pwd = message.split(/ +/).slice(1).join(" ");
  roomPassword = pwd;
  room.setPassword(pwd || null);
  announce(pwd ? `🔑 Contraseña: ${pwd}` : "🔑 Contraseña removida.", player.id, 0xffefd6, "bold", 1);
}

function restartCommand() {
  cancelGameVariable = true;
  instantRestart();
  announceAll("🔃 Partido reiniciado.", 0xffefd6, "bold", 1);
}

function swapCommand() {
  clearTimeout(removingTimeout);
  removingPlayers = true;
  removingTimeout = setTimeout(() => { removingPlayers = false; }, 100);
  swapButton();
}

function slowmodeCommand(player, message) {
  const n = parseInt(message.split(/ +/)[1]) || 0;
  slowMode = n;
  announceAll(`🐢 Modo lento: ${n} segundos`, 0xffefd6, "bold", 1);
}


function xpCommand(player) {
  const auth  = getAuth(player);
  const stats = getStats(auth);
  const xp    = stats.xp ?? 0;
  const rango = getRango(xp);
  const nivel = getNivel(xp);
  const next  = RANGOS[rango.index + 1];
  const progreso = next
    ? `${xp - rango.xpMin}/${next.xpMin - rango.xpMin} XP para ${next.nombre}`
    : "¡Rango máximo!";
  announce(
    `✨ ${player.name} — ${rango.nombre} (Nivel ${nivel})\n` +
    `XP Total: ${xp} | ${progreso}`,
    player.id, 0xf1c40f, "bold", 0
  );
}


  const auth  = getAuth(player);
  const stats = getStats(auth);
  const xp    = stats.xp ?? 0;
  const rango = getRango(xp);
  const nivel = getNivel(xp);
  const next  = RANGOS[rango.index + 1];
  const progreso = next
    ? `${xp - rango.xpMin}/${next.xpMin - rango.xpMin} XP para ${next.nombre}`
    : "¡Rango máximo!";


function getCommand(name) {
  if (commands[name]) return name;
  for (const [key, cmd] of Object.entries(commands)) {
    if (cmd.aliases?.includes(name)) return key;
  }
  return false;
}

const commands = {
  // ── Jugadores ──────────────────────────────────────────────────────────────
  help:        { aliases: ["commands","ayuda"],  minRole: 0, desc: "Lista de comandos. Usa !help <cmd> para detalles.",         function: helpCommand },
  stats:       { aliases: ["estadisticas"],      minRole: 0, desc: "Ver tus estadísticas.",                                     function: statsCommand },
  showstats:   { aliases: ["share"],             minRole: 0, desc: "Mostrar tus estadísticas a todos.",                         function: showStatsCommand },
  resetstats:  { aliases: ["rs"],                minRole: 0, desc: "Resetear tus estadísticas.",                                function: resetStatsCommand },
  xp:          { aliases: ["rango","rank"],       minRole: 0, desc: "Ver tu XP y rango actual.",                                   function: xpCommand },
  top:         { aliases: ["leaderboard","elo"], minRole: 0, desc: "Top 5 por score.",                                          function: (p) => printRankings("elo", p.id) },
  topgoals:    { aliases: ["goals"],             minRole: 0, desc: "Top 5 goleadores.",                                         function: (p) => printRankings("goals", p.id) },
  topassists:  { aliases: ["assists"],           minRole: 0, desc: "Top 5 asistencias.",                                        function: (p) => printRankings("assists", p.id) },
  topwins:     { aliases: ["wins"],              minRole: 0, desc: "Top 5 victorias.",                                          function: (p) => printRankings("wins", p.id) },
  topcs:       { aliases: ["cs"],                minRole: 0, desc: "Top 5 clean sheets.",                                       function: (p) => printRankings("cs", p.id) },
  topplaytime: { aliases: ["playtime"],          minRole: 0, desc: "Top 5 tiempo jugado.",                                      function: (p) => printRankings("playtime", p.id) },
  afk:         { aliases: [],                    minRole: 0, desc: "Ir a espectadores como AFK.",                               function: afkCommand },
  sub:         { aliases: [],                    minRole: 0, desc: "AFK durante un partido (cooldown 5 min).",                  function: subCommand },
  afks:        { aliases: ["afklist"],           minRole: 0, desc: "Ver jugadores AFK.",                                        function: afkListCommand },
  leave:       { aliases: ["salir"],             minRole: 0, desc: "Salir de la sala.",                                         function: leaveCommand },
  avatar:      { aliases: [],                    minRole: 0, desc: "Activar/desactivar indicadores de movimiento.",             function: avatarCommand },
  discord:     { aliases: [],                    minRole: 0, desc: "Link del Discord oficial.",                                  function: discordCommand },
  anon:        { aliases: [],                    minRole: 0, desc: "Enviar mensaje anónimo (cooldown 15 min).",                 function: anonCommand },
  votekick:    { aliases: [],                    minRole: 0, desc: "Iniciar votación para expulsar. Ej: !votekick #5",          function: votekickCommand },
  vote:        { aliases: [],                    minRole: 0, desc: "Votar en la votación activa.",                              function: voteCommand },
  calladmin:   { aliases: ["admin"],             minRole: 0, desc: "Llamar a un administrador.",                                function: callAdminCommand },
  rename:      { aliases: [],                    minRole: 0, desc: "Cambiar nombre en estadísticas.",                           function: renameCommand },
  claimadmin:  { aliases: [],                    minRole: 0, desc: false,                                                       function: claimAdminCommand },
  // ── VIP ───────────────────────────────────────────────────────────────────
  jump:        { aliases: [],                    minRole: 1, desc: "Saltar al primer lugar de la fila (VIP+).",                 function: jumpCommand },
  // ── Mod ───────────────────────────────────────────────────────────────────
  mute:        { aliases: [],                    minRole: 2, desc: "Mutear jugador. !mute #ID [min]",                           function: muteCommand },
  unmute:      { aliases: [],                    minRole: 2, desc: "Desmutear jugador. !unmute #ID",                            function: unmuteCommand },
  mutelist:    { aliases: [],                    minRole: 2, desc: "Ver jugadores muteados.",                                   function: muteListCommand },
  slowmode:    { aliases: [],                    minRole: 2, desc: "Modo lento en segundos. !slowmode 3",                       function: slowmodeCommand },
  // ── Admin ─────────────────────────────────────────────────────────────────
  setvip:      { aliases: [],                    minRole: 3, desc: "Otorgar VIP. !setvip #ID",                                  function: setVipCommand },
  removevip:   { aliases: [],                    minRole: 3, desc: "Remover VIP. !removevip #ID",                               function: removeVipCommand },
  viplist:     { aliases: [],                    minRole: 3, desc: "Ver jugadores VIP.",                                        function: vipListCommand },
  setmod:      { aliases: [],                    minRole: 3, desc: "Otorgar Mod. !setmod #ID",                                  function: setModCommand },
  removemod:   { aliases: [],                    minRole: 3, desc: "Remover Mod. !removemod #ID",                               function: removeModCommand },
  restart:     { aliases: [],                    minRole: 3, desc: "Reiniciar partido.",                                        function: restartCommand },
  swap:        { aliases: [],                    minRole: 3, desc: "Intercambiar equipos.",                                     function: swapCommand },
  clearbans:   { aliases: [],                    minRole: 3, desc: "Desbanear todos o uno. !clearbans [N°]",                    function: clearbansCommand },
  banlist:     { aliases: ["bans"],              minRole: 3, desc: "Ver baneados.",                                             function: banListCommand },
  password:    { aliases: [],                    minRole: 3, desc: "Contraseña de sala. !password [clave]",                     function: passwordCommand },
  stafflist:   { aliases: ["adminlist"],         minRole: 3, desc: "Ver todo el staff.",                                        function: adminListCommand },
  // ── Owner ─────────────────────────────────────────────────────────────────
  setadmin:    { aliases: [],                    minRole: 4, desc: "Otorgar Admin. !setadmin #ID",                              function: setAdminCommand },
  removeadmin: { aliases: [],                    minRole: 4, desc: "Remover Admin. !removeadmin #ID",                           function: removeAdminCommand },
};
