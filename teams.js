// =============================================================================
//  teams.js — Gestión de equipos, lineups y balance automático
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
  announceAll("🐢 Modo lento: 3 segundos", 0xffefd6, "bold", 1);
}

function deactivateChooseMode() {
  chooseMode        = false;
  redCaptainChoice  = "";
  blueCaptainChoice = "";
  clearTimeout(timeOutCap);
  if (slowMode !== 0) {
    slowMode = 0;
    announceAll("🐢 Modo lento: desactivado", 0xffefd6, "bold", 1);
  }
}

function getSpecList(captain) {
  if (!captain) return;
  let msg = "📃 Fila: ";
  teamSpec.forEach((p, i) => msg += `${p.name}[${i+1}], `);
  room.sendAnnouncement(msg.slice(0, -2) + ".", captain.id, 0xe2e2e2, "bold", 1);
}

function choosePlayer() {
  clearTimeout(timeOutCap);
  const captain = teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0];
  if (!captain) return;
  room.sendAnnouncement(
    "📖 Elegí un jugador por número, 'top', 'random' o 'bottom'",
    captain.id, 0xe2e2e2, "bold", 2
  );
  timeOutCap = setTimeout(cap => {
    room.sendAnnouncement("⏱️ ¡10 segundos para elegir!", cap.id, 0xffa135, "bold", 2);
    timeOutCap = setTimeout(c => {
      room.kickPlayer(c.id, "No elegiste a tiempo.", false);
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
      room.sendAnnouncement("¡Número inválido!", player.id, 0xed5050, "bold", 1);
      return false;
    }
    targetPlayer = teamSpec[n - 1];
  }

  if (targetPlayer) {
    clearTimeout(timeOutCap);
    room.setPlayerTeam(targetPlayer.id, targetTeam);
    announceAll(`✅ ${player.name} eligió a ${targetPlayer.name}`, 0xffefd6, "bold", 1);
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
        announceAll("🤡 Ragequit detectado, partido finalizado.", 0xe2e2e2, "bold", 2);
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

