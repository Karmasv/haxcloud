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
  if (!target) { announce(t.cmd_invalid_player(), player.id, 0xed5050, "bold", 1); return; }
  if (target.id === player.id) { announce(t.cmd_no_self_msg(), player.id, 0xed5050, "bold", 1); return; }
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
    if (playerId) announce(t.top_empty(), playerId, 0xed5050, "bold", 1);
    return;
  }

  const icons  = { elo: "💎", goals: "⚽", assists: "⭐", wins: "🏆", losses: "😵", cs: "🧤", playtime: "⏱️" };
  const icon   = icons[stat] ?? "💐";
  const header = t.top_header();
  const footer = t.top_footer();
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
    let msg = t.cmd_help_intro() + "\n";
    for (const [key, cmd] of Object.entries(commands)) {
      if (cmd.desc && cmd.minRole === 0) msg += ` !${key},`;
    }
    msg = msg.slice(0, -1) + ".\n";
    if (role >= 1) {
      let vipMsg = t.cmd_help_vip();
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 1) vipMsg += ` !${key},`;
      }
      if (!vipMsg.endsWith(":")) msg += vipMsg.slice(0, -1) + ".\n";
    }
    if (role >= 2) {
      let modMsg = t.cmd_help_mod();
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 2) modMsg += ` !${key},`;
      }
      if (!modMsg.endsWith(":")) msg += modMsg.slice(0, -1) + ".\n";
    }
    if (role >= 3) {
      let adminMsg = t.cmd_help_admin();
      for (const [key, cmd] of Object.entries(commands)) {
        if (cmd.desc && cmd.minRole === 3) adminMsg += ` !${key},`;
      }
      if (!adminMsg.endsWith(":")) msg += adminMsg.slice(0, -1) + ".\n";
    }
    if (role >= 4) {
      let ownerMsg = t.cmd_help_owner();
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
  announceAll(t.stats_share(player.name), 0x52b788, "bold", 0);
  announceAll(
    `📋 Partidos: ${stats.games} | 🏆 ${stats.wins}W 😵 ${stats.losses}L | 📊 ${stats.winrate}\n` +
    `⚽ ${stats.goals}G ⭐ ${stats.assists}A 🧤 ${stats.CS}CS | 💎 Score: ${score} | ⏱️ ${formatTimeLong(stats.playtime)}`,
    0xe2e2e2, "bold", 0
  );
}

function resetStatsCommand(player) {
  const auth = getAuth(player);
  localStorage.removeItem(auth);
  announce(t.stats_reset(), player.id, 0xffefd6, "bold", 1);
}

function afkCommand(player) {
  if (player.team === 0) { announce(t.afk_already_spec(), player.id, 0xed5050, "bold", 1); return; }
  if (AFKSet.has(player.id)) { announce(t.afk_already_afk(), player.id, 0xed5050, "bold", 1); return; }
  AFKSet.add(player.id);
  room.setPlayerTeam(player.id, 0);
  announceAll(t.afk_gone(player.name), 0xffefd6, "bold", 1);
  updateTeams();
  handlePlayersLeave();
}

function subCommand(player) {
  const now    = Date.now();
  const scores = room.getScores();
  if (scores && ((player.team === 1 && scores.red < scores.blue) || (player.team === 2 && scores.blue < scores.red))) {
    announce(t.afk_cant_losing(), player.id, 0xed5050, "bold", 1);
    return;
  }
  if (AFKSet.has(player.id)) {
    if (AFKMinSet.has(player.id)) { announce("⏱️ Debes esperar antes de usar !sub de nuevo.", player.id, 0xffa135, "bold", 1); }
    else {
      AFKSet.delete(player.id);
      announceAll(t.afk_back(player.name), 0xffefd6, "normal", 1);
      updateTeams(); handlePlayersJoin();
    }
    return;
  }
  if (afkCooldownTimes.has(player.id)) {
    const remaining = (CONFIG.cooldowns.sub - (now - afkCooldownTimes.get(player.id))) / 1000;
    if (remaining > 0) {
      announce(t.afk_cooldown(Math.floor(remaining/60), Math.floor(remaining%60)), player.id, 0xffa135, "bold", 1);
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
  announceAll(t.afk_gone(player.name), 0xffefd6, "bold", 1);
  updateTeams(); handlePlayersLeave();
}

function afkListCommand(player) {
  if (AFKSet.size === 0) { announce(t.afk_list_empty(), player.id, 0xffefd6, "bold", null); return; }
  let afkNames = []; AFKSet.forEach(id => { const p = room.getPlayer(id); if (p) afkNames.push(p.name); }); announce(t.afk_list(afkNames.join(", ")), player.id, 0xffefd6, "bold", null);
}

function leaveCommand(player) {
  room.kickPlayer(player.id, t.leave_msg(), false);
}

function avatarCommand(player) {
  if (avatarEnabled.has(player.id)) {
    avatarEnabled.delete(player.id);
    prevPositions.delete(player.id);
    room.setPlayerAvatar(player.id, null);
    announce(t.avatar_off(), player.id, 0xffefd6, "bold", 1);
  } else {
    avatarEnabled.add(player.id);
    const disc = room.getPlayerDiscProperties(player.id);
    if (disc) prevPositions.set(player.id, { x: disc.x, y: disc.y });
    announce(t.avatar_on(), player.id, 0xffefd6, "bold", 1);
  }
}

function discordCommand(player) {
  announce(t.discord_title(), player.id, 0x2d6a4f, "bold",   0);
  announce(t.discord_subtitle(),  player.id, 0x52b788, "normal", 0);
  announce(CONFIG.discord,                  player.id, 0x52b788, "bold",   0);
}

function jumpCommand(player) {
  if (gameState !== 0 || playSituation !== 2) {
    announce(t.jump_game_only(), player.id, 0xed5050, "bold", 1);
    return;
  }
  if (player.team !== 0) {
    announce(t.jump_spec_only(), player.id, 0xed5050, "bold", 1);
    return;
  }
  const auth   = getAuth(player);
  const role   = getRole(player);
  if (role < 1) {
    announce(t.jump_vip_only(), player.id, 0xe2e2e2, "bold", 1);
    return;
  }
  const now      = Date.now();
  const cooldown = role >= 2 ? CONFIG.cooldowns.jumpMod : CONFIG.cooldowns.jumpVip;
  if (jumpCooldowns.has(auth)) {
    const remaining = (jumpCooldowns.get(auth) + cooldown - now) / 1000;
    if (remaining > 0) {
      announce(t.afk_cooldown(Math.floor(remaining/60), Math.floor(remaining%60)), player.id, 0xffa135, "bold", 1);
      return;
    }
  }
  const specs = room.getPlayerList().filter(p => p.team === 0 && p.id !== player.id);
  room.reorderPlayers([player.id, ...specs.map(p => p.id)], true);
  jumpCooldowns.set(auth, now);
  announceAll(t.jump_done(player.name), 0xffefd6, "bold", 1);
}

function anonCommand(player, message) {
  const now  = Date.now();
  if (anonCooldownTimes.has(player.id)) {
    const remaining = (CONFIG.cooldowns.anonMsg - (now - anonCooldownTimes.get(player.id))) / 1000;
    if (remaining > 0) {
      announce(t.afk_cooldown(Math.floor(remaining/60), Math.floor(remaining%60)), player.id, 0xffa135, "bold", 1);
      return;
    }
  }
  const text = message.split(/ +/).slice(1).join(" ");
  if (!text) { announce(t.anon_empty(), player.id, 0xed5050, "bold", 1); return; }
  anonCooldownTimes.set(player.id, now);
  setTimeout(() => anonCooldownTimes.delete(player.id), CONFIG.cooldowns.anonMsg);
  announceAll(t.anon_msg(text), 0xe2e2e2, "normal", 0);
}

function votekickCommand(player, message) {
  if (voteKickData.active) { announce(t.vote_active(), player.id, 0xed5050, "bold", 1); return; }
  const idStr = message.split(/ +/)[1];
  if (!idStr?.startsWith("#")) { announce(t.vote_usage(), player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(idStr.slice(1)));
  if (!target || target.id === player.id) { announce(t.vote_invalid(), player.id, 0xed5050, "bold", 1); return; }
  if (getRole(target) >= 2) { announce(t.vote_no_mod(), player.id, 0xed5050, "bold", 1); return; }
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
    announceAll(t.vote_expired(voteKickData.target?.name), 0xe2e2e2, "normal", 0);
    voteKickData.active = false; voteKickData.target = null;
  }, 60_000);
}

function voteCommand(player) {
  if (!voteKickData.active) { announce(t.vote_no_active(), player.id, 0xed5050, "bold", 1); return; }
  if (voteKickData.voters.has(player.id)) { announce(t.vote_already(), player.id, 0xed5050, "bold", 1); return; }
  voteKickData.votes++;
  voteKickData.voters.add(player.id);
  if (voteKickData.votes >= voteKickData.requiredVotes) {
    clearTimeout(voteKickData.timeout);
    room.kickPlayer(voteKickData.target.id, "Expulsado por votación.", false);
    announceAll(`✅ ${voteKickData.target.name} fue expulsado por votación.`, 0xffefd6, "bold", 1);
    voteKickData.active = false; voteKickData.target = null;
  } else {
    announceAll(t.vote_progress(player.name, voteKickData.votes, voteKickData.requiredVotes), 0xffa135, "normal", 0);
  }
}

function callAdminCommand(player, message) {
  const motivo = message.split(/ +/).slice(1).join(" ") || "llamada de admin";
  announceAll(t.calladmin_msg(player.name), 0xed5050, "bold", 1);
  webhookSoporte(player, motivo);
}

function renameCommand(player, message) {
  const auth    = getAuth(player);
  const newName = message.split(/ +/).slice(1).join(" ");
  if (!newName) { announce(t.rename_empty(), player.id, 0xed5050, "bold", 1); return; }
  const stats = getStats(auth);
  stats.playerName = newName;
  saveStats(auth, stats);
  announce(t.rename_done(newName), player.id, 0xffefd6, "bold", 1);
}

function claimAdminCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  if (args[0] !== CONFIG.claimPassword) {
    announce(t.owner_wrong(), player.id, 0xed5050, "bold", 1);
    return;
  }
  const auth = getAuth(player);
  if (ownerList.some(o => o[0] === auth)) {
    room.setPlayerAdmin(player.id, true);
    announce(t.owner_relogin(), player.id, 0xffefd6, "bold", 1);
    return;
  }
  ownerList.push([auth, player.name]);
  room.setPlayerAdmin(player.id, true);
  announceAll(t.owner_claimed(player.name), 0xffefd6, "bold", 1);
}

function muteCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  if (!args[0]?.startsWith("#")) { announce(t.mute_usage(), player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(args[0].slice(1)));
  if (!target) { announce(t.cmd_not_found(), player.id, 0xed5050, "bold", 1); return; }
  if (getRole(target) >= getRole(player)) { announce(t.mute_rank(), player.id, 0xed5050, "bold", 1); return; }
  if (muteArray.getByPlayerId(target.id)) { announce(t.mute_already(), player.id, 0xed5050, "bold", 1); return; }
  const minutes = parseInt(args[1]) || 5;
  const mp      = new MutePlayer(target.name, target.id, getAuth(target));
  mp.setDuration(minutes);
  announceAll(t.mute_done(target.name, minutes), 0xffefd6, "bold", 1);
}

function unmuteCommand(player, message) {
  const arg = message.split(/ +/)[1];
  if (!arg) { announce("❌ Uso: !unmute #ID", player.id, 0xed5050, "bold", 1); return; }
  const mp = arg.startsWith("#")
    ? muteArray.getByPlayerId(parseInt(arg.slice(1)))
    : muteArray.getById(parseInt(arg));
  if (!mp) { announce(t.unmute_notfound(), player.id, 0xed5050, "bold", 1); return; }
  mp.remove();
  announceAll(t.unmute_done(mp.name), 0xffefd6, "bold", 1);
}

function muteListCommand(player) {
  if (muteArray.list.length === 0) { announce(t.mute_empty(), player.id, 0xffefd6, "bold", null); return; }
  const muteNames = muteArray.list.map(mp => `${mp.name}[${mp.id}]`).join(", "); announce(t.mute_list(muteNames), player.id, 0xffefd6, "bold", null);
}

function setVipCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !setvip #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce(t.cmd_not_found(), player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  if (vipList.some(v => v[0] === auth)) { announce(t.setvip_already(), player.id, 0xed5050, "bold", 1); return; }
  vipList.push([auth, target.name]);
  announceAll(t.setvip_done(target.name), 0xffefd6, "bold", 1);
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
  if (idx < 0 || idx >= vipList.length) { announce(t.removevip_nf(), player.id, 0xed5050, "bold", 1); return; }
  const name = vipList[idx][1];
  vipList.splice(idx, 1);
  announceAll(t.removevip_done(name), 0xffefd6, "bold", 1);
}

function vipListCommand(player) {
  if (vipList.length === 0) { announce(t.vip_empty(), player.id, 0xffefd6, "bold", null); return; }
  const vipNames = vipList.map((v,i) => `${v[1]}[${i}]`).join(", "); announce(t.vip_list(vipNames), player.id, 0xffefd6, "bold", null);
}

function setModCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !setmod #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce(t.cmd_not_found(), player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  if (modList.some(m => m[0] === auth)) { announce(t.setmod_already(), player.id, 0xed5050, "bold", 1); return; }
  modList.push([auth, target.name]);
  room.setPlayerAdmin(target.id, true);
  announceAll(t.setmod_done(target.name), 0xffefd6, "bold", 1);
}

function removeModCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !removemod #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce(t.cmd_not_found(), player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  modList = modList.filter(m => m[0] !== auth);
  room.setPlayerAdmin(target.id, false);
  announceAll(t.removemod_done(target.name), 0xffefd6, "bold", 1);
}

function setAdminCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !setadmin #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce(t.cmd_not_found(), player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  if (adminList.some(a => a[0] === auth)) { announce(t.setadmin_already(), player.id, 0xed5050, "bold", 1); return; }
  adminList.push([auth, target.name]);
  room.setPlayerAdmin(target.id, true);
  announceAll(t.setadmin_done(target.name), 0xffefd6, "bold", 1);
}

function removeAdminCommand(player, message) {
  const arg    = message.split(/ +/)[1];
  if (!arg?.startsWith("#")) { announce("❌ Uso: !removeadmin #ID", player.id, 0xed5050, "bold", 1); return; }
  const target = room.getPlayer(parseInt(arg.slice(1)));
  if (!target) { announce(t.cmd_not_found(), player.id, 0xed5050, "bold", 1); return; }
  const auth = getAuth(target);
  adminList = adminList.filter(a => a[0] !== auth);
  room.setPlayerAdmin(target.id, false);
  announceAll(t.removeadmin_done(target.name), 0xffefd6, "bold", 1);
}

function adminListCommand(player) {
  const lines = [];
  if (ownerList.length)  lines.push("👑 Owners: "  + ownerList.map(o => o[1]).join(", "));
  if (adminList.length)  lines.push("🌟 Admins: "  + adminList.map(a => a[1]).join(", "));
  if (modList.length)    lines.push("🛡️ Mods: "    + modList.map(m => m[1]).join(", "));
  if (lines.length === 0) { announce(t.admin_none(), player.id, 0xffefd6, "bold", null); return; }
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
    if (isNaN(idx) || idx < 0 || idx >= banList.length) { announce(t.clearbans_inv(), player.id, 0xed5050, "bold", 1); return; }
    room.clearBan(banList[idx][1]);
    const name = banList[idx][0];
    banList.splice(idx, 1);
    announceAll(t.clearbans_one(name), 0xffefd6, "bold", null);
  }
}

function banListCommand(player) {
  if (banList.length === 0) { announce(t.bans_empty(), player.id, 0xffefd6, "bold", null); return; }
  const banNames = banList.map((b,i) => `${b[0]}[${i}]`).join(", "); announce(t.bans_list(banNames), player.id, 0xffefd6, "bold", null);
}

function passwordCommand(player, message) {
  const pwd = message.split(/ +/).slice(1).join(" ");
  roomPassword = pwd;
  room.setPassword(pwd || null);
  announce(pwd ? t.password_set(pwd) : t.password_rm(), player.id, 0xffefd6, "bold", 1);
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
  announceAll(t.slowmode_msg(n), 0xffefd6, "bold", 1);
}

function xpCommand(player) {
  const auth  = getAuth(player);
  const stats = getStats(auth);
  const xp    = stats.xp ?? 0;
  const rango = getRango(xp);
  const nivel = getNivel(xp);
  const next  = RANGOS[rango.index + 1];
  const progreso = next
    ? t.xp_progress(xp - rango.xpMin, next.xpMin - rango.xpMin, next.nombre)
    : t.xp_max();
  announce(
    t.xp_line1(player.name, rango.nombre, nivel) + "\n" + t.xp_line2(xp, progreso),
    player.id, 0xf1c40f, "bold", 0
  );
}

// --- NUEVO: Comando Anti-VPN ---
function antiVPNCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  const allowed = getRole(player) >= 3; // Admin+

  if (!allowed) {
    announce(t.cmd_no_perm(), player.id, 0xed5050, "bold", 1);
    return;
  }

  if (args.length !== 1 || (args[0] !== 'on' && args[0] !== 'off')) {
    announce('❌ Uso: !antivpn on/off', player.id, 0xed5050, "bold", 1);
    return;
  }

  antiVPNEnabled = (args[0] === 'on');
  const estado = antiVPNEnabled ? 'ACTIVADO' : 'DESACTIVADO';
  const color = antiVPNEnabled ? 0x57f287 : 0xed4245;
  
  announceAll(`🛡️ Filtro Anti-VPN: ${estado}`, color, "bold", 1);
}

// --- NUEVO: Comando !lookup ---
function lookupCommand(player, message) {
  const args = message.split(/ +/).slice(1);
  if (args.length === 0) {
    announce('❌ Uso: !lookup <nombre>', player.id, 0xed5050, "bold", 1);
    return;
  }

  const searchName = args.join(' ').toLowerCase();
  let foundPlayer = null;
  let isOnline = false;

  // 1. Buscar en jugadores conectados
  const allPlayers = room.getPlayerList();
  for (const p of allPlayers) {
    if (p.name.toLowerCase().includes(searchName)) {
      foundPlayer = p;
      isOnline = true;
      break;
    }
  }

  // 2. Si no está online, buscar en localStorage (stats guardadas)
  if (!foundPlayer) {
    const allStats = getAllPlayerStats();
    const match = allStats.find(s => s.playerName.toLowerCase().includes(searchName));
    if (match) {
      foundPlayer = { name: match.playerName, auth: match.auth || 'N/A' };
      isOnline = false;
    }
  }

  if (!foundPlayer) {
    announce(`❌ No se encontró ningún jugador con "${args.join(' ')}"`, player.id, 0xed5050, "bold", 1);
    return;
  }

  // Construir mensaje de respuesta
  let msg = `🔍 **Lookup: ${foundPlayer.name}**\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;

  // Auth
  msg += `🔒 Auth: \`${getAuth(foundPlayer) || 'N/A'}\`\n`;

  // IP (solo si está online)
  if (isOnline) {
    const conn = getConn(foundPlayer);
    const ip = conn ? hexToIP(conn) : 'N/A';
    msg += `🌐 IP: \`${ip}\`\n`;
    msg += `🔗 Conn: \`${conn || 'N/A'}\`\n`;
  } else {
    msg += `🌐 IP: Desconectado\n`;
  }

  // Estadísticas
  const auth = getAuth(foundPlayer) || foundPlayer.auth;
  if (auth && auth !== 'N/A') {
    const stats = getStats(auth);
    if (stats) {
      const score = getPlayerScore(stats);
      const xp = stats.xp ?? 0;
      const rango = getRango(xp);
      const nivel = getNivel(xp);

      msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `⭐ ${rango.nombre} (Nivel ${nivel})\n`;
      msg += `✨ XP: ${xp} | 💎 Score: ${score}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📊 Partidos: ${stats.games} | 🏆 ${stats.wins}W 😵 ${stats.losses}L\n`;
      msg += `📈 Winrate: ${stats.winrate}\n`;
      msg += `⚽ Goles: ${stats.goals} | ⭐ Asistencias: ${stats.assists}\n`;
      msg += `🧤 CS: ${stats.CS} | 🐸 OG: ${stats.ownGoals}\n`;
      msg += `⏱️ Tiempo: ${formatTimeLong(stats.playtime)}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;

      if (isOnline) {
        msg += `🟢 **Conectado ahora mismo**\n`;
      } else {
        msg += `🔴 **Desconectado**\n`;
      }
    }
  }

  announce(msg, player.id, 0x2d6a4f, "bold", 0);
}

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
  lookup:      { aliases: ["buscar", "find"],    minRole: 0, desc: "Buscar estadísticas de un jugador. !lookup <nombre>",       function: lookupCommand },
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
  antivpn:     { aliases: [],                    minRole: 3, desc: "Activar/desactivar filtro Anti-VPN. !antivpn on/off",       function: antiVPNCommand },
  // ── Owner ─────────────────────────────────────────────────────────────────
  setadmin:    { aliases: [],                    minRole: 4, desc: "Otorgar Admin. !setadmin #ID",                              function: setAdminCommand },
  removeadmin: { aliases: [],                    minRole: 4, desc: "Remover Admin. !removeadmin #ID",                           function: removeAdminCommand },
};
