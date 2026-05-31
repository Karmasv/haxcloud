// =============================================================================
//  teams.js — Gestión de equipos, balance automático, choose mode y Gana Sigue
// =============================================================================

function updateTeams() {
  playersAll = room.getPlayerList();
  players    = playersAll.filter(p => !AFKSet.has(p.id));
  teamRed    = players.filter(p => p.team === 1);
  teamBlue   = players.filter(p => p.team === 2);
  teamSpec   = players.filter(p => p.team === 0);
}

function getTeamArray(team, includeAll = true) {
  if (team === 1) return teamRed;
  if (team === 2) return teamBlue;
  return includeAll ? playersAll.filter(p => p.team === 0) : teamSpec;
}

function GetTeam(team) {
  return room.getPlayerList().filter(p => p.id !== 0 && p.team === team);
}

function updateAdmins(excludeId = 0) {
  const hasAdmin = players.some(p => p.admin);
  if (players.length > 0 && !hasAdmin) {
    const candidates = players.filter(p => p.id !== excludeId && !p.admin);
    if (candidates.length > 0) {
      room.setPlayerAdmin(Math.min(...candidates.map(p => p.id)), true);
    }
  }
}

function getStartingLineups() {
  return [
    teamRed.map(p => new PlayerComposition(p, getAuth(p), [0], [])),
    teamBlue.map(p => new PlayerComposition(p, getAuth(p), [0], [])),
  ];
}

function getPlayerComp(player) {
  if (!player || player.id === 0) return null;
  const auth = getAuth(player);
  for (const comp of [...game.playerComp[0], ...game.playerComp[1]]) {
    if (comp.auth === auth) return comp;
  }
  return null;
}

function handleLineupChangeTeamChange(player) {
  if (gameState === 2) return;
  const auth = getAuth(player);
  const time = game.scores?.time ?? 0;
  for (let t = 0; t < 2; t++) {
    const teamNum = t + 1;
    const idx = game.playerComp[t].findIndex(c => c.auth === auth);
    if (player.team === teamNum) {
      if (idx !== -1) {
        const comp = game.playerComp[t][idx];
        if (comp.timeExit.includes(time)) comp.timeExit = comp.timeExit.filter(x => x !== time);
        else comp.timeEntry.push(time);
      } else {
        game.playerComp[t].push(new PlayerComposition(player, auth, [time], []));
      }
    } else if (idx !== -1) {
      const comp = game.playerComp[t][idx];
      if (comp.timeEntry.includes(time)) {
        if (time === 0) game.playerComp[t].splice(idx, 1);
        else comp.timeEntry = comp.timeEntry.filter(x => x !== time);
      } else {
        comp.timeExit.push(time);
      }
    }
  }
}

function handleLineupChangeLeave(player) {
  if (playSituation === 0) return;
  const auth = getAuth(player);
  const time = game.scores?.time ?? 0;
  for (let t = 0; t < 2; t++) {
    const idx = game.playerComp[t].findIndex(c => c.auth === auth);
    if (idx !== -1) {
      const comp = game.playerComp[t][idx];
      if (comp.timeEntry.includes(time)) {
        if (time === 0) game.playerComp[t].splice(idx, 1);
        else comp.timeEntry = comp.timeEntry.filter(x => x !== time);
      } else {
        comp.timeExit.push(time);
      }
    }
  }
}

// =============================================================================

function sortByPosition(arr) {
  return [...arr].sort((a, b) => a.position.x - b.position.x);
}

function topButton() {
  if (teamSpec.length === 0) return;
  if (teamRed.length === teamBlue.length && teamSpec.length > 1) {
    room.setPlayerTeam(teamSpec[0].id, 1);
    room.setPlayerTeam(teamSpec[1].id, 2);
  } else if (teamRed.length < teamBlue.length) {
    room.setPlayerTeam(teamSpec[0].id, 1);
  } else {
    room.setPlayerTeam(teamSpec[0].id, 2);
  }
}

function randomButton() {
  if (teamSpec.length === 0) return;
  if (teamRed.length === teamBlue.length && teamSpec.length > 1) {
    const i1 = getRandomInt(teamSpec.length);
    room.setPlayerTeam(teamSpec[i1].id, 1);
    const remaining = teamSpec.filter(p => p.id !== teamSpec[i1].id);
    room.setPlayerTeam(remaining[getRandomInt(remaining.length)].id, 2);
  } else {
    const team = teamRed.length < teamBlue.length ? 1 : 2;
    room.setPlayerTeam(teamSpec[getRandomInt(teamSpec.length)].id, team);
  }
}

function swapButton() {
  const blueIds = teamBlue.map(p => p.id);
  const redIds  = teamRed.map(p => p.id);
  for (const id of blueIds) room.setPlayerTeam(id, 1);
  for (const id of redIds)  room.setPlayerTeam(id, 2);
}

function redToSpecButton() {
  clearTimeout(removingTimeout);
  removingPlayers = true;
  removingTimeout = setTimeout(() => { removingPlayers = false; }, 100);
  for (let i = teamRed.length - 1; i >= 0; i--) room.setPlayerTeam(teamRed[i].id, 0);
}

function blueToSpecButton() {
  clearTimeout(removingTimeout);
  removingPlayers = true;
  removingTimeout = setTimeout(() => { removingPlayers = false; }, 100);
  for (let i = teamBlue.length - 1; i >= 0; i--) room.setPlayerTeam(teamBlue[i].id, 0);
}

function resetButton() {
  clearTimeout(removingTimeout);
  removingPlayers = true;
  removingTimeout = setTimeout(() => { removingPlayers = false; }, 100);
  const all = [...teamRed, ...teamBlue];
  for (const p of all) room.setPlayerTeam(p.id, 0);
}

function instantRestart() {
  room.stopGame();
  startTimeout = setTimeout(() => room.startGame(), 10);
}

function resumeGame() {
  startTimeout = setTimeout(() => room.startGame(), 1000);
  setTimeout(() => room.pauseGame(false), 500);
}

function activateChooseMode() {
  chooseMode = true;
  slowMode   = 3;
  announceAll(t.slowmode_msg(3), 0xffefd6, "bold", 1);
}

function deactivateChooseMode() {
  chooseMode        = false;
  redCaptainChoice  = "";
  blueCaptainChoice = "";
  clearTimeout(timeOutCap);
  if (slowMode !== 0) {
    slowMode = 0;
    announceAll(t.slowmode_off(), 0xffefd6, "bold", 1);
  }
}

function getSpecList(captain) {
  if (!captain) return;
  let msg = t.choose_list("").replace("", ""); msg = "";
  teamSpec.forEach((p, i) => msg += `${p.name}[${i+1}], `);
  room.sendAnnouncement(msg.slice(0, -2) + ".", captain.id, 0xe2e2e2, "bold", 1);
}

function choosePlayer() {
  clearTimeout(timeOutCap);
  const captain = teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0];
  if (!captain) return;
  room.sendAnnouncement(
    t.choose_pick(),
    captain.id, 0xe2e2e2, "bold", 2
  );
  timeOutCap = setTimeout(cap => {
    room.sendAnnouncement(t.choose_10s(), cap.id, 0xffa135, "bold", 2);
    timeOutCap = setTimeout(c => {
      room.kickPlayer(c.id, t.choose_timeout(), false);
    }, 10_000, cap);
  }, 20_000, captain);
  if (teamRed.length && teamBlue.length) getSpecList(captain);
}

function chooseModeFunction(player, message) {
  const cmd      = message.split(/ +/)[0].toLowerCase();
  const isRedCap = teamRed.length <= teamBlue.length && player.id === teamRed[0]?.id;
  const isBlueCap= teamRed.length >  teamBlue.length && player.id === teamBlue[0]?.id;
  if (!isRedCap && !isBlueCap) return false;

  const targetTeam = isRedCap ? 1 : 2;
  let targetPlayer = null;

  if      (["top","auto"].includes(cmd))    { targetPlayer = teamSpec[0]; }
  else if (["random","rand"].includes(cmd)) { targetPlayer = teamSpec[getRandomInt(teamSpec.length)]; }
  else if (["bottom","bot"].includes(cmd))  { targetPlayer = teamSpec[teamSpec.length - 1]; }
  else {
    const n = parseInt(cmd);
    if (isNaN(n) || n < 1 || n > teamSpec.length) {
      room.sendAnnouncement(t.choose_invalid(), player.id, 0xed5050, "bold", 1);
      return false;
    }
    targetPlayer = teamSpec[n - 1];
  }

  if (targetPlayer) {
    clearTimeout(timeOutCap);
    room.setPlayerTeam(targetPlayer.id, targetTeam);
    announceAll(t.choose_done(player.name, targetPlayer.name), 0xffefd6, "bold", 1);
  }
  return true;
}

function checkCaptainLeave(player) {
  const redCap  = teamRed[0]?.id  === player.id && chooseMode && teamRed.length  <= teamBlue.length;
  const blueCap = teamBlue[0]?.id === player.id && chooseMode && teamBlue.length <  teamRed.length;
  if (redCap || blueCap) {
    choosePlayer();
    capLeft = true;
    setTimeout(() => { capLeft = false; }, 10);
  }
}

function ghostKickHandle(ghost, newPlayer) {
  const teamArr = getTeamArray(ghost.team, true).map(p => p.id);
  const idx     = teamArr.findIndex(id => id === ghost.id);
  if (idx !== -1) teamArr.splice(idx, 1, newPlayer.id);
  room.kickPlayer(ghost.id, "👻 Ghost kick", false);
  room.setPlayerTeam(newPlayer.id, ghost.team);
  room.setPlayerAdmin(newPlayer.id, ghost.admin);
  room.reorderPlayers(teamArr, true);
  if (ghost.team !== 0 && playSituation !== 0) {
    const disc = room.getPlayerDiscProperties(ghost.id);
    if (disc) room.setPlayerDiscProperties(newPlayer.id, disc);
  }
}

function slowModeFunction(player) {
  if (player.admin) return false;
  if (SMSet.has(player.id)) return true;
  SMSet.add(player.id);
  setTimeout(id => SMSet.delete(id), slowMode * 1000, player.id);
  return false;
}


function balanceTeams() {
  if (chooseMode) return;
  if (players.length === 0) { room.stopGame(); return; }

  if (players.length === 1 && teamRed.length === 0) {
    instantRestart();
    room.setPlayerTeam(players[0].id, 1);
    return;
  }

  const diff = Math.abs(teamRed.length - teamBlue.length);

  if (diff === teamSpec.length && teamSpec.length > 0) {
    if (players.length === 2) instantRestart();
    const target = teamRed.length > teamBlue.length ? 2 : 1;
    for (const p of teamSpec) room.setPlayerTeam(p.id, target);
  } else if (diff > teamSpec.length) {
    if (players.length === 1) {
      instantRestart();
      room.setPlayerTeam(players[0].id, 1);
      return;
    }
    if (players.length === 5) instantRestart();
    const longer = teamRed.length > teamBlue.length ? teamRed : teamBlue;
    for (let i = 0; i < diff; i++) room.setPlayerTeam(longer[longer.length - 1 - i].id, 0);
  } else if (diff < teamSpec.length && teamRed.length !== teamBlue.length) {
    room.pauseGame(true);
    activateChooseMode();
    choosePlayer();
  } else if (teamSpec.length >= 2 && teamRed.length === teamBlue.length && teamRed.length < 4) {
    if (teamRed.length === 2) instantRestart();
    topButton();
  }
}

function handlePlayersJoin() {
  if (chooseMode) {
    if (players.length === 6) instantRestart();
    getSpecList(teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0]);
  }
  balanceTeams();
}

function handlePlayersLeave() {
  if (gameState !== 2) {
    const s = room.getScores();
    if (players.length >= 8 && s.time >= 0.8333 * s.timeLimit && teamRed.length !== teamBlue.length) {
      const redUp  = teamRed.length  < teamBlue.length && s.blue - s.red  === 2;
      const blueUp = teamBlue.length < teamRed.length  && s.red  - s.blue === 2;
      if (redUp || blueUp) {
        endGame(redUp ? 2 : 1);
        announceAll(t.ragequit(), 0xe2e2e2, "bold", 2);
        stopTimeout = setTimeout(() => room.stopGame(), 100);
        return;
      }
    }
  }
  if (!chooseMode) { balanceTeams(); return; }

  if (!teamRed.length || !teamBlue.length) {
    const spec = teamSpec[0];
    if (spec) room.setPlayerTeam(spec.id, !teamRed.length ? 1 : 2);
    return;
  }

  const diff = Math.abs(teamRed.length - teamBlue.length);
  if (diff === teamSpec.length) {
    deactivateChooseMode();
    resumeGame();
    const target = teamRed.length > teamBlue.length ? 2 : 1;
    teamSpec.forEach((p, i) => {
      clearTimeout(insertingTimeout);
      insertingPlayers = true;
      setTimeout(() => room.setPlayerTeam(p.id, target), 5 * i);
    });
    insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 5 * teamSpec.length);
    return;
  }

  if ((teamRed.length === 4 && teamBlue.length === 4) ||
      (teamRed.length === teamBlue.length && teamSpec.length < 2)) {
    deactivateChooseMode();
    resumeGame();
    return;
  }

  if (capLeft) choosePlayer();
  else getSpecList(teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0]);
  balanceTeams();
}

function handlePlayersTeamChange(byPlayer) {
  if (!chooseMode || removingPlayers || byPlayer !== null) return;
  const diff = Math.abs(teamRed.length - teamBlue.length);

  if (diff === teamSpec.length) {
    deactivateChooseMode();
    resumeGame();
    const target = teamRed.length > teamBlue.length ? 2 : 1;
    teamSpec.forEach((p, i) => {
      clearTimeout(insertingTimeout);
      insertingPlayers = true;
      setTimeout(() => room.setPlayerTeam(p.id, target), 5 * i);
    });
    insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 5 * teamSpec.length);
    return;
  }

  if ((teamRed.length === 4 && teamBlue.length === 4) ||
      (teamRed.length === teamBlue.length && teamSpec.length < 2)) {
    deactivateChooseMode();
    resumeGame();
    return;
  }

  const cap = teamRed.length <= teamBlue.length ? redCaptainChoice : blueCaptainChoice;
  if (cap !== "") {
    const team = teamRed.length <= teamBlue.length ? 1 : 2;
    const p    = cap === "top"    ? teamSpec[0]
               : cap === "random" ? teamSpec[getRandomInt(teamSpec.length)]
               :                    teamSpec[teamSpec.length - 1];
    if (p) room.setPlayerTeam(p.id, team);
  } else {
    choosePlayer();
  }
}

function handlePlayersStop(byPlayer) {
  if (byPlayer !== null || !endGameVariable) return;

  if (chooseMode) {
    if (players.length === 8) {
      chooseMode = false;
      resetButton();
      for (let i = 0; i < 4; i++) {
        clearTimeout(insertingTimeout);
        insertingPlayers = true;
        setTimeout(() => randomButton(), 200 * i);
      }
      insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 800);
      startTimeout = setTimeout(() => room.startGame(), 2000);
    } else {
      if      (lastWinner === 1) blueToSpecButton();
      else if (lastWinner === 2) { redToSpecButton(); setTimeout(swapButton, 10); }
      else resetButton();
      clearTimeout(insertingTimeout);
      insertingPlayers = true;
      setTimeout(topButton, 300);
      insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 300);
    }
    return;
  }

  if (players.length === 2) {
    if (lastWinner === 2) swapButton();
    startTimeout = setTimeout(() => room.startGame(), 2000);
  } else if (players.length === 3 || players.length >= 9) {
    if (lastWinner === 1) blueToSpecButton();
    else { redToSpecButton(); setTimeout(swapButton, 5); }
    clearTimeout(insertingTimeout);
    insertingPlayers = true;
    setTimeout(topButton, 200);
    insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 300);
    startTimeout = setTimeout(() => room.startGame(), 2000);
  } else if (players.length === 4) {
    resetButton();
    clearTimeout(insertingTimeout);
    insertingPlayers = true;
    setTimeout(() => { randomButton(); setTimeout(randomButton, 500); }, 500);
    insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 2000);
    startTimeout = setTimeout(() => room.startGame(), 2000);
  } else if (players.length === 5) {
    if (lastWinner === 1) blueToSpecButton();
    else { redToSpecButton(); setTimeout(swapButton, 5); }
    clearTimeout(insertingTimeout);
    insertingPlayers = true;
    insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 200);
    setTimeout(topButton, 200);
    activateChooseMode();
  } else if (players.length === 6) {
    resetButton();
    clearTimeout(insertingTimeout);
    insertingPlayers = true;
    insertingTimeout = setTimeout(() => { insertingPlayers = false; }, 1500);
    setTimeout(() => {
      randomButton();
      setTimeout(() => { randomButton(); setTimeout(randomButton, 500); }, 500);
    }, 500);
    startTimeout = setTimeout(() => room.startGame(), 2000);
  }
}

// =============================================================================
//  NUEVO SISTEMA: GANA SIGUE + PICK
// =============================================================================

// Estado global del pick
const ganaSigueState = {
  active: false,              // ¿Estamos en fase de pick?
  redCaptain: null,           // ID del capitán rojo
  blueCaptain: null,          // ID del capitán azul
  pickingTeam: 0,             // ¿Qué equipo elige ahora? (1 = rojo, 2 = azul)
  picksThisTurn: 0,           // Picks que lleva el equipo actual (para el patrón 1-2-2-2...)
  timeout: null,              // Timeout para la elección
  MAX_PLAYERS_PER_TEAM: 4,    // Tamaño máximo de equipo
  PICK_TIMEOUT_MS: 30000      // 30 segundos para elegir
};

/**
 * Arranca el sistema Gana Sigue después de que termine un partido.
 */
function iniciarGanaSigue() {
  updateTeams();

  // Si no hay suficientes jugadores, arranca normal
  if (players.length < 4) {
    balanceTeams();
    startTimeout = setTimeout(() => room.startGame(), 2000);
    return;
  }

  // Determinar quién ganó (o equipo local si empate)
  const winner = lastWinner === 1 ? 1 : lastWinner === 2 ? 2 : 1;

  // Mover al equipo perdedor a espectadores
  if (winner === 1) {
    for (const p of teamBlue) room.setPlayerTeam(p.id, 0);
  } else {
    for (const p of teamRed) room.setPlayerTeam(p.id, 0);
  }

  updateTeams();

  // El equipo ganador se queda (ya está en su team)
  // Elegir capitanes
  const equipoGanador = winner === 1 ? teamRed : teamBlue;
  const espectadores = teamSpec;

  if (equipoGanador.length === 0 || espectadores.length === 0) {
    // Sin algún equipo, balance normal
    balanceTeams();
    startTimeout = setTimeout(() => room.startGame(), 2000);
    return;
  }

  // Capitán del equipo ganador: el que más XP tenga
  let redCap, blueCap;
  if (winner === 1) {
    redCap = elegirCapitan(equipoGanador);
    blueCap = elegirCapitan(espectadores);
  } else {
    blueCap = elegirCapitan(equipoGanador);
    redCap = elegirCapitan(espectadores);
  }

  if (!redCap || !blueCap) {
    balanceTeams();
    startTimeout = setTimeout(() => room.startGame(), 2000);
    return;
  }

  // Mover al capitán azul al equipo azul
  room.setPlayerTeam(blueCap.id, 2);
  updateTeams();

  // Configurar estado
  ganaSigueState.active = true;
  ganaSigueState.redCaptain = redCap.id;
  ganaSigueState.blueCaptain = blueCap.id;
  ganaSigueState.pickingTeam = 1; // Empieza rojo
  ganaSigueState.picksThisTurn = 0;
  ganaSigueState.MAX_PLAYERS_PER_TEAM = Math.min(4, Math.floor(players.length / 2));

  chooseMode = true;
  slowMode = 3;
  announceAll(t.slowmode_msg(3), 0xffefd6, "bold", 1);

  announceAll(
    `🏆 ¡GANAS SIGUE! ${winner === 1 ? '🔴 ROJO' : '🔵 AZUL'} se queda en cancha.\n` +
    `👑 Capitanes: ${redCap.name} (🔴) vs ${blueCap.name} (🔵)\n` +
    `📖 Cada capitán usa !pick <número> para elegir.`,
    0xffd700, "bold", 2
  );

  // Iniciar primera ronda de pick
  iniciarRondaPick();
}

/**
 * Elige al jugador con más XP de una lista.
 */
function elegirCapitan(lista) {
  if (lista.length === 0) return null;
  let mejor = lista[0];
  let mejorXP = -1;
  for (const p of lista) {
    const auth = getAuth(p);
    if (!auth) continue;
    const stats = getStats(auth);
    const xp = stats.xp ?? 0;
    if (xp > mejorXP) {
      mejorXP = xp;
      mejor = p;
    }
  }
  return mejor;
}

/**
 * Inicia una ronda de pick para que el capitán actual elija.
 */
function iniciarRondaPick() {
  clearTimeout(ganaSigueState.timeout);

  const capId = ganaSigueState.pickingTeam === 1
    ? ganaSigueState.redCaptain
    : ganaSigueState.blueCaptain;

  const cap = room.getPlayer(capId);
  if (!cap) {
    finalizarGanaSigue();
    return;
  }

  updateTeams();
  const specs = teamSpec;

  // Si no hay espectadores, terminar
  if (specs.length === 0 || teamsCompletos()) {
    finalizarGanaSigue();
    return;
  }

  // Mostrar lista de espectadores al capitán
  let lista = "📃 Jugadores disponibles:\n";
  specs.forEach((p, i) => {
    const auth = getAuth(p);
    const stats = auth ? getStats(auth) : null;
    const xp = stats?.xp ?? 0;
    lista += `  ${i + 1}. ${p.name} (XP: ${xp})\n`;
  });
  room.sendAnnouncement(lista, cap.id, 0xe2e2e2, "normal", 1);
  room.sendAnnouncement(
    `👉 Eres el capitán. Usa !pick <número> para elegir (30 segundos).`,
    cap.id, 0xffd700, "bold", 2
  );

  // Timeout: si no elige, se asigna aleatorio
  ganaSigueState.timeout = setTimeout(() => {
    const specs = teamSpec;
    if (specs.length > 0 && !teamsCompletos()) {
      const randomPick = specs[getRandomInt(specs.length)];
      aplicarPick(ganaSigueState.pickingTeam, randomPick, true);
    }
  }, ganaSigueState.PICK_TIMEOUT_MS);
}

/**
 * Verifica si ambos equipos ya están completos.
 */
function teamsCompletos() {
  const reds = teamRed.length;
  const blues = teamBlue.length;
  const max = ganaSigueState.MAX_PLAYERS_PER_TEAM;
  return reds >= max && blues >= max;
}

/**
 * Aplica una elección de un capitán.
 * @param {number} team - Equipo que recibe al jugador (1 o 2)
 * @param {object} targetPlayer - Jugador elegido
 * @param {boolean} silent - Si es true, no muestra anuncio de "X eligió a Y"
 */
function aplicarPick(team, targetPlayer, silent = false) {
  if (targetPlayer.team !== 0) return; // Ya está en un equipo

  room.setPlayerTeam(targetPlayer.id, team);
  updateTeams();

  if (!silent) {
    const capId = team === 1 ? ganaSigueState.redCaptain : ganaSigueState.blueCaptain;
    const cap = room.getPlayer(capId);
    if (cap) {
      announceAll(
        `✅ ${cap.name} eligió a ${targetPlayer.name} para el equipo ${team === 1 ? '🔴 ROJO' : '🔵 AZUL'}.`,
        0xffd700, "bold", 1
      );
    }
  }

  // Control del patrón de picks: 1-2-2-2...
  ganaSigueState.picksThisTurn++;

  if (ganaSigueState.picksThisTurn === 1) {
    // Primer pick del turno: cambia al otro equipo
    ganaSigueState.pickingTeam = ganaSigueState.pickingTeam === 1 ? 2 : 1;
    ganaSigueState.picksThisTurn = 0;
  }

  // Verificar si ya terminamos
  if (teamsCompletos() || teamSpec.length === 0) {
    finalizarGanaSigue();
  } else {
    iniciarRondaPick();
  }
}

/**
 * Comando !pick para los capitanes.
 */
function pickCommand(player, message) {
  if (!ganaSigueState.active) {
    announce("❌ No hay fase de pick activa.", player.id, 0xed5050, "bold", 1);
    return;
  }

  const capId = ganaSigueState.pickingTeam === 1
    ? ganaSigueState.redCaptain
    : ganaSigueState.blueCaptain;

  if (player.id !== capId) {
    announce("❌ No es tu turno de elegir.", player.id, 0xed5050, "bold", 1);
    return;
  }

  const arg = message.split(/ +/)[1];
  const n = parseInt(arg);
  if (isNaN(n) || n < 1 || n > teamSpec.length) {
    announce(`❌ Elige un número del 1 al ${teamSpec.length}.`, player.id, 0xed5050, "bold", 1);
    return;
  }

  const target = teamSpec[n - 1];
  if (!target) {
    announce("❌ Jugador no válido.", player.id, 0xed5050, "bold", 1);
    return;
  }

  aplicarPick(ganaSigueState.pickingTeam, target);
}

/**
 * Finaliza el Gana Sigue y arranca el partido.
 */
function finalizarGanaSigue() {
  clearTimeout(ganaSigueState.timeout);
  ganaSigueState.active = false;
  ganaSigueState.redCaptain = null;
  ganaSigueState.blueCaptain = null;

  chooseMode = false;
  slowMode = 0;
  announceAll(t.slowmode_off(), 0xffefd6, "bold", 1);

  // Si algún equipo está incompleto, balancear automáticamente
  updateTeams();
  if (teamRed.length !== teamBlue.length) {
    const diff = Math.abs(teamRed.length - teamBlue.length);
    const smaller = teamRed.length < teamBlue.length ? 1 : 2;
    for (let i = 0; i < diff && teamSpec.length > 0; i++) {
      room.setPlayerTeam(teamSpec[0].id, smaller);
    }
  }

  announceAll("⚽ ¡Partido listo! Comenzando...", 0x52b788, "bold", 2);
  updateTeams();
  startTimeout = setTimeout(() => room.startGame(), 2000);
}