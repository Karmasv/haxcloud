// =============================================================================
//  physics.js — Física, mecánicas de juego, porteros y goles
// =============================================================================

function calculateStadiumVariables() {
  if (!checkStadiumVariable || teamRed.length + teamBlue.length === 0) return;
  checkStadiumVariable = false;
  setTimeout(() => {
    const ball   = room.getDiscProperties(0);
    const player = teamRed.concat(teamBlue)[0];
    if (!ball || !player) return;
    const disc = room.getPlayerDiscProperties(player.id);
    if (!disc) return;
    ballRadius       = ball.radius;
    playerRadius     = disc.radius;
    triggerDistance  = ballRadius + playerRadius + 0.01;
    speedCoefficient = 100 / (5 * ball.invMass * (ball.damping ** 60 + 1));
  }, 1);
}

function getBallSpeed() {
  const disc = room.getDiscProperties(0);
  return Math.sqrt(disc.xspeed ** 2 + disc.yspeed ** 2) * speedCoefficient;
}

function getLastTouchOfTheBall() {
  const ball = room.getBallPosition();
  updateTeams();
  const near = [];
  for (const p of players) {
    if (!p.position) continue;
    const d = Math.sqrt((p.position.x - ball.x) ** 2 + (p.position.y - ball.y) ** 2);
    if (d < triggerDistance) {
      if (playSituation === 1) playSituation = 2;
      near.push([p, d]);
    }
  }
  if (near.length === 0) return;
  const closest = near.sort((a, b) => a[1] - b[1])[0][0];
  if (lastTeamTouched === closest.team || lastTeamTouched === 0) {
    if (!lastTouches[0] || lastTouches[0].player.id !== closest.id) {
      const goalCount = game.scores.red + game.scores.blue;
      game.touchArray.push(new BallTouch(closest, game.scores.time, goalCount, ball));
      const len = game.touchArray.length;
      lastTouches[0] = checkGoalKickTouch(game.touchArray, len - 1, goalCount);
      lastTouches[1] = checkGoalKickTouch(game.touchArray, len - 2, goalCount);
    }
  }
  lastTeamTouched = closest.team;
}

function checkGoalKickTouch(touchArray, idx, goalCount) {
  if (!touchArray[idx]) return null;
  const t = touchArray[idx];
  return (t && t.goal === goalCount) ? t : null;
}

function getGameStats() {
  if (playSituation !== 2 || gameState !== 0) return;
  possession[lastTeamTouched === 1 ? 0 : 1]++;
  const ball = room.getBallPosition();
  actionZoneHalf[ball.x < 0 ? 0 : 1]++;
  handleGK();
}

function getGoalAttribution(team) {
  const result = [null, null];
  if (!lastTouches[0]) return result;
  result[0] = lastTouches[0].player;
  if (lastTouches[0].player.team === team && lastTouches[1]?.player.team === team) {
    result[1] = lastTouches[1].player;
  }
  return result;
}


function handleGKTeam(team) {
  if (team === 0) return null;
  const arr = team === 1 ? teamRed : teamBlue;
  return arr.reduce((best, p) => {
    if (!best) return p;
    return team === 1
      ? (best.position?.x < p.position?.x ? best : p)
      : (best.position?.x > p.position?.x ? best : p);
  }, null);
}

function handleGK() {
  [1, 2].forEach(t => {
    const fwd  = handleGKTeam(t);
    const comp = fwd ? getPlayerComp(fwd) : null;
    if (comp) comp.GKTicks++;
  });
}

function getGK(team) {
  if (team === 0) return null;
  const arr = game.playerComp[team - 1];
  return arr.reduce((best, c) => (!best || c.GKTicks > best.GKTicks ? c : best), null);
}

function getCS(scores) {
  const result = [];
  const gkRed  = getGK(1);
  const gkBlue = getGK(2);
  if (gkRed  && scores.blue === 0) result.push(gkRed.player.name);
  if (gkBlue && scores.red  === 0) result.push(gkBlue.player.name);
  return result;
}

function getCSString(scores) {
  const cs = getCS(scores);
  if (cs.length === 0) return null;
  if (cs.length === 1) return `🧤 Clean Sheet: ${cs[0]} no recibió goles`;
  return `🧱 Clean Sheet: ${cs[0]} y ${cs[1]} mantuvieron su arco en cero`;
}


function getGametimePlayer(comp) {
  if (!comp) return 0;
  let total = 0;
  for (let i = 0; i < comp.timeEntry.length; i++) {
    total += (comp.timeExit[i] ?? game.scores.time) - comp.timeEntry[i];
  }
  return Math.floor(total);
}

function getGoalsPlayer(comp) {
  if (!comp) return 0;
  return game.goals.filter(g => g.striker?.id === comp.player.id && g.team === comp.player.team).length;
}

function getAssistsPlayer(comp) {
  if (!comp) return 0;
  return game.goals.filter(g => g.assist?.id === comp.player.id && g.team === comp.player.team).length;
}

function getOwnGoalsPlayer(comp) {
  if (!comp) return 0;
  return game.goals.filter(g => g.striker?.id === comp.player.id && g.team !== comp.player.team).length;
}

function getCSPlayer(comp) {
  if (!comp) return 0;
  const gk = getGK(comp.player.team);
  return (gk?.player.id === comp.player.id && getCS(game.scores).length > 0) ? 1 : 0;
}

function updatePlayerStats(player, teamNum) {
  const auth = getAuth(player);
  if (!auth) return;
  const comp  = getPlayerComp(player);
  const stats = getStats(auth);
  stats.playerName = player.name;
  stats.games++;
  if (lastWinner === teamNum) stats.wins++;
  stats.winrate   = ((stats.wins / stats.games) * 100).toFixed(1) + "%";
  const goles    = getGoalsPlayer(comp);
  const asists   = getAssistsPlayer(comp);
  const ogs      = getOwnGoalsPlayer(comp);
  const cs       = getCSPlayer(comp);
  stats.goals    += goles;
  stats.assists  += asists;
  stats.ownGoals += ogs;
  stats.CS       += cs;
  stats.playtime += getGametimePlayer(comp);
  stats.losses    = stats.games - stats.wins;
  // XP
  const xpGanada = calcularXpPartido(comp, teamNum, lastWinner);
  stats.xp = Math.max(0, (stats.xp ?? 0) + xpGanada);
  // Session tracking para webhook desconexión
  stats._sessionGoals   = goles;
  stats._sessionAssists = asists;
  stats._sessionXp      = xpGanada;
  saveStats(auth, stats);
  // Anunciar subida de rango en sala
  const rangoActual = getRango(stats.xp);
  const rangoAnterior = getRango(Math.max(0, stats.xp - xpGanada));
  if (rangoActual.index > rangoAnterior.index) {
    room.sendAnnouncement(
      `🎉 ¡${player.name} subió a ${rangoActual.nombre}! (${stats.xp} XP)`,
      null, 0xf1c40f, "bold", 1
    );
  }
}

function updateStats() {
  const s = game.scores;
  const enoughPlayers = players.length >= CONFIG.stats.minPlayers
    && teamRedStats.length  >= CONFIG.stats.minPlayersPerTeam
    && teamBlueStats.length >= CONFIG.stats.minPlayersPerTeam;
  const enoughTime = s.time >= CONFIG.stats.minTimeRatio * s.timeLimit
    || s.red  === s.scoreLimit
    || s.blue === s.scoreLimit;
  if (!enoughPlayers || !enoughTime) return;
  for (const p of teamRedStats)  updatePlayerStats(p, 1);
  for (const p of teamBlueStats) updatePlayerStats(p, 2);
}


const GOAL_PHRASES_ASSIST = [
  "gran pared con", "jugada armada junto a",
  "toque preciso de", "asistencia de",
  "combinación con",
];

const GOAL_PHRASES_SOLO = [
  "definición con categoría", "remate preciso",
  "gol bien trabajado", "la mandó a guardar",
  "sin dudarlo",
];

const OWN_GOAL_PHRASES = [
  "{} se equivocó feo",
  "{} regaló el balón",
  "Error grave de {}",
  "{} quedó retratado",
  "{} se durmió",
];

function randomPhrase(arr) { return arr[getRandomInt(arr.length)]; }

function getGoalString(team) {
  const scores   = game.scores;
  const goalInfo = getGoalAttribution(team);
  const time     = `[${formatTime(scores.time)}]`;
  const speed    = `${ballSpeed.toFixed(2)} km/h`;

  if (!goalInfo[0]) {
    game.goals.push(new Goal(scores.time, team, null, null));
    return `⚽ ${time} Gol para ${team === 1 ? "🔴 Rojo" : "🔵 Azul"} • ${speed}`;
  }

  if (goalInfo[0].team !== team) {
    const phrase = randomPhrase(OWN_GOAL_PHRASES).replace("{}", goalInfo[0].name);
    game.goals.push(new Goal(scores.time, team, goalInfo[0], null));
    return `🐸 ${time} ${phrase} • ${speed}`;
  }

  if (goalInfo[1] && goalInfo[1].team === team) {
    const phrase = randomPhrase(GOAL_PHRASES_ASSIST);
    game.goals.push(new Goal(scores.time, team, goalInfo[0], goalInfo[1]));
    return `⚽ ${time} ${goalInfo[0].name}, ${phrase} ${goalInfo[1].name} • ${speed}`;
  }

  const phrase = randomPhrase(GOAL_PHRASES_SOLO);
  game.goals.push(new Goal(scores.time, team, goalInfo[0], null));
  return `⚽ ${time} ${goalInfo[0].name}, ${phrase} • ${speed}`;
}

