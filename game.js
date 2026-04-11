// =============================================================================
//  game.js — Control de tiempo, golden goal, fin de partido y avatares
// =============================================================================

function getMovementDirection(curr, prev) {
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return "◯";
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "⇢" : "⇠";
  if (Math.abs(dy) > Math.abs(dx)) return dy > 0 ? "⇣" : "⇡";
  if (dx > 0) return dy > 0 ? "🡖" : "🡕";
  return dy > 0 ? "🡗" : "🡔";
}

function handleAvatarMovement() {
  for (const id of avatarEnabled) {
    const player = room.getPlayer(id);
    const disc   = player ? room.getPlayerDiscProperties(id) : null;
    if (!player || !disc) continue;
    const prev = prevPositions.get(id);
    if (!prev) { prevPositions.set(id, { x: disc.x, y: disc.y }); continue; }
    room.setPlayerAvatar(id, getMovementDirection(disc, prev));
    prevPositions.set(id, { x: disc.x, y: disc.y });
  }
}

function handleAvatarPlayerLeave(player) {
  avatarEnabled.delete(player.id);
  prevPositions.delete(player.id);
}


function handleActivityPlayer(player) {
  const comp = getPlayerComp(player);
  if (!comp) return;
  comp.inactivityTicks++;
  if (comp.inactivityTicks === CONFIG.inactivityWarnAt) {
    room.sendAnnouncement(
      t.inactivity_warn(player.name),
      player.id, 0xffa135, "bold", 2
    );
    return;
  }
  if (comp.inactivityTicks >= CONFIG.inactivityKickAt) {
    comp.inactivityTicks = 0;
    if (game.scores?.time <= 19.5) {
      setTimeout(() => { chooseMode ? room.stopGame() : instantRestart(); }, 10);
    }
    room.kickPlayer(player.id, t.inactivity_kick(), false);
  }
}

function handleActivity() {
  if (gameState !== 0 || players.length <= 1) return;
  for (const p of teamRed)  handleActivityPlayer(p);
  for (const p of teamBlue) handleActivityPlayer(p);
}

function handleActivityStop() {
  for (const p of players) {
    const comp = getPlayerComp(p);
    if (comp) comp.inactivityTicks = 0;
  }
}

function handleActivityPlayerTeamChange(player) {
  if (player.team === 0) {
    const comp = getPlayerComp(player);
    if (comp) comp.inactivityTicks = 0;
  }
}



function checkTime() {
  const s = room.getScores();
  if (!s || s.timeLimit === 0) return;

  if (Math.abs(s.time - s.timeLimit) <= 0.01) {
    if (checkTimeVariable) return;
    checkTimeVariable = true;
    setTimeout(() => { checkTimeVariable = false; }, 10);
    if (s.red !== s.blue) {
      endGame(s.red > s.blue ? 1 : 2);
      stopTimeout = setTimeout(() => room.stopGame(), 2000);
      return;
    }
    goldenGoal = true;
    announceAll(t.golden_goal(), 0xffefd6, "bold", 1);
  }

  if (Math.abs(s.time - 600 - s.timeLimit) <= 0.01 && !checkTimeVariable) {
    checkTimeVariable = true;
    setTimeout(() => { checkTimeVariable = false; }, 10);
    endGame(0);
    room.stopGame();
    goldenGoal = false;
  }
}

function endGame(winner) {
  if (players.length >= 7) activateChooseMode();
  const scores = room.getScores();
  game.scores  = scores;
  lastWinner   = winner;
  endGameVariable = true;

  const redPoss  = ((possession[0] / (possession[0] + possession[1] || 1)) * 100).toFixed(0);
  const bluePoss = (100 - parseFloat(redPoss)).toFixed(0);
  const redZone  = ((actionZoneHalf[0] / (actionZoneHalf[0] + actionZoneHalf[1] || 1)) * 100).toFixed(0);
  const blueZone = (100 - parseFloat(redZone)).toFixed(0);

  if (winner === 1 || winner === 2) {
    streak = winner === 1 ? streak + 1 : 1;
    announceAll(t.result_bar1(),          0x2d6a4f, "bold",   2);
    announceAll(t.result_score(scores.red, scores.blue), 0x52b788, "bold",   2);
    announceAll(t.result_poss(redPoss, bluePoss),     0x74c69d, "normal", 2);
    announceAll(t.result_zone(redZone, blueZone),     0x74c69d, "normal", 2);
    if (streak > 1) announceAll(t.result_streak(streak), 0x3b82f6, "italic", 2);
    const csStr = getCSString(scores);
    if (csStr) announceAll(csStr, 0xede37d, "normal", 2);
  } else {
    streak = 0;
    announceAll(t.result_draw(), 0x9ca3af, "bold", 2);
  }

  updateStats();
}
