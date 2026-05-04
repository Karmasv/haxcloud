// =============================================================================
//  events.js — Event handlers de HaxBall (Power Bar + Sliding)
// =============================================================================

room.onPlayerJoin = function(player) {
  // Almacenamos auth y conn directamente desde el objeto player (gracias al parche)
  authMap.set(player.id, { auth: player.auth, conn: player.conn });

  // Blacklist
  const banned = blackList.some(([auth]) => auth && auth === player.auth);
  if (banned) {
    announceAll(t.blacklist_ban(player.name), null, "normal", 0);
    room.kickPlayer(player.id, t.blacklist_msg(CONFIG.discord), true);
    return;
  }

  // Banner de bienvenida
  const banner = [
    { text: t.welcome_bar1(), color: 0x2d6a4f },
    { text: t.welcome_bar2(),         color: 0x40916c },
    { text: t.welcome_bar3(), color: 0x2d6a4f },
    { text: t.welcome_msg(player.name), color: null },
    { text: t.welcome_discord(CONFIG.discord), color: null },
  ];
  banner.forEach((line, i) => {
    room.sendAnnouncement(line.text, player.id, line.color, i < 3 ? "bold" : "normal", 1);
  });

  // Anuncio según rol
  const role = getRole(player);
  if      (role === 4) { announceAll(t.joined_owner(player.name),    0xffefd6, "bold", 1); room.setPlayerAdmin(player.id, true); }
  else if (role === 3) { announceAll(t.joined_admin(player.name),    0xffefd6, "bold", 1); room.setPlayerAdmin(player.id, true); }
  else if (role === 2) { announceAll(t.joined_mod(player.name),     0xffefd6, "bold", 1); room.setPlayerAdmin(player.id, true); }
  else if (role === 1) { announceAll(t.joined_vip(player.name),      0xffefd6, "bold", 1); }

  // Ghost kick
  const ghosts = playersAll.filter(p => p.id !== player.id && authMap.get(p.id)?.auth === player.auth);
  for (const ghost of ghosts) ghostKickHandle(ghost, player);

  // Registrar inicio de sesión
  sessionStart.set(player.id, Date.now());

  updateTeams();
  updateAdmins();
  handlePlayersJoin();

  // Webhook actividad
  webhookConexion(player);

  // Bloqueo VIP al llenarse
  if (room.getPlayerList().length >= CONFIG.vipLockAt) {
    room.setPassword(CONFIG.vipPassword);
    roomPassword = CONFIG.vipPassword;
    announceAll(t.vip_lock(CONFIG.vipLockAt, CONFIG.room.maxPlayers), 0xffefd6, "bold", 1);
  }
};

room.onPlayerLeave = function(player) {
  handleLineupChangeLeave(player);
  checkCaptainLeave(player);
  spamDetection.removeUser(player.id);
  voteKickData.voters?.delete(player.id);

  updateTeams();
  updateAdmins(player.id);
  handlePlayersLeave();
  handleAvatarPlayerLeave(player);

  if (playersAll.length <= CONFIG.vipLockAt) {
    room.setPassword(null);
    roomPassword = "";
    announceAll(t.vip_unlock(), 0xe2e2e2, "bold", 1);
  }

  // Webhook desconexión
  const sesionMs = sessionStart.has(player.id)
    ? Date.now() - sessionStart.get(player.id)
    : 0;
  sessionStart.delete(player.id);
  webhookDesconexion(player, Math.floor(sesionMs / 1000));

  setTimeout(() => authMap.delete(player.id), 100);
};

room.onPlayerKicked = function(player, reason, ban, byPlayer) {
  kickFetchVariable = true;
  if (ban && byPlayer && getRole(byPlayer) < 2) {
    room.clearBan(player.id);
    announce(t.cmd_no_perm(), byPlayer.id, 0xed5050, "bold", 1);
    room.setPlayerAdmin(byPlayer.id, false);
    return;
  }
  if (ban) banList.push([player.name, player.id]);
  // Webhook registro de baneo/kick
  webhookBaneo(player, reason, ban, byPlayer);
};

room.onPlayerTeamChange = function(player, byPlayer) {
  handleLineupChangeTeamChange(player);

  if (AFKSet.has(player.id) && player.team !== 0) {
    room.setPlayerTeam(player.id, 0);
    announceAll(`😴 ${player.name} está AFK, no puede jugar.`, 0xffefd6, "bold", 1);
    return;
  }

  updateTeams();

  if (gameState !== 2 && player.team !== 0) {
    const scores = room.getScores();
    if (scores && scores.time <= 0.75 * scores.timeLimit && Math.abs(scores.blue - scores.red) < 2) {
      if (player.team === 1) teamRedStats.push(player);
      else                   teamBlueStats.push(player);
    }
  }

  handleActivityPlayerTeamChange(player);
  handlePlayersTeamChange(byPlayer);
};

room.onPlayerChat = function(player, message) {
  if (gameState !== 2 && player.team !== 0) {
    const comp = getPlayerComp(player);
    if (comp) comp.inactivityTicks = 0;
  }

  spamDetection.checkSpam(player, message);

  // Muteado — bloquear mensaje
  if (muteArray.getByPlayerId(player.id)) return false;

  // Webhook chat-sala (todo el chat público)
  webhookChat(player, message);

  const words = message.split(/ +/);

  // Emojis rápidos
  const quickEmojis = { q: "🤨", mb: "🥺", ez: "🥱", "1": "🥅" };
  if (quickEmojis[message]) {
    room.setPlayerAvatar(player.id, quickEmojis[message]);
    setTimeout(() => room.setPlayerAvatar(player.id, null), 1500);
  }

  // Comandos
  if (words[0][0] === "!") {
    const key = getCommand(words[0].slice(1).toLowerCase());
    if (key !== false && commands[key].minRole <= getRole(player)) {
      commands[key].function(player, message);
    }
    return false;
  }

  // Chat de equipo
  if (words[0].toLowerCase() === "t") { teamChat(player, message); return false; }

  // Mensaje directo
  if (words[0].startsWith("@@")) { playerChat(player, message); return false; }

  // Choose mode
  if (chooseMode && teamRed.length && teamBlue.length) {
    if (chooseModeFunction(player, message)) return false;
  }

  // Slow mode
  if (slowMode > 0 && slowModeFunction(player)) return false;
};

room.onGameStart = function(player) {
  game               = new Game();
  lastTouches        = [null, null];
  lastTeamTouched    = 0;
  possession         = [0, 0];
  actionZoneHalf     = [0, 0];
  playSituation      = 1;
  goldenGoal         = false;
  endGameVariable    = false;
  cancelGameVariable = false;
  checkStadiumVariable = true;
  teamRedStats       = teamRed.slice();
  teamBlueStats      = teamBlue.slice();
  gameState          = 0;
  announceWinProbability();
};

room.onGameStop = function(player) {
  game.rec = room.stopRecording();

  const s = room.getScores() ?? game.scores;
  const shouldSave =
    !cancelGameVariable &&
    game.playerComp[0].length + game.playerComp[1].length > 0 &&
    s && s.timeLimit !== 0 &&
    s.time >= 0.5 * s.timeLimit &&
    (endGameVariable || s.time >= 0.75 * s.timeLimit);

  if (shouldSave) {
    fetchResultado(game);
  }

  room.setDiscProperties(0, { radius: 5.8, color: 0xffa500, xspeed: 0, yspeed: 0 });
  cancelGameVariable = false;
  endGameVariable    = false;
  gameState          = 2;
  playSituation      = 0;
  updateTeams();
  handlePlayersStop(player);
  handleActivityStop();
};

room.onGamePause = function(player) {
  clearTimeout(unpauseTimeout);
  gameState = 1;
};

room.onGameUnpause = function(player) {
  unpauseTimeout = setTimeout(() => { gameState = 0; }, 2000);
  if (chooseMode && (
    (teamRed.length === 4 && teamBlue.length === 4) ||
    (teamRed.length === teamBlue.length && teamSpec.length < 2)
  )) {
    deactivateChooseMode();
  }
};

room.onTeamGoal = function(team) {
  ballSpeed = getBallSpeed();
  const goalStr = getGoalString(team);
  if (goldenGoal) {
    endGame(team);
    stopTimeout = setTimeout(() => room.stopGame(), 2000);
  }
  if (goalStr) announceAll(goalStr, team === 1 ? 0xff4c4c : 0x62cbff, "bold", 0);

  // Avatar goleador
  const goalInfo = getGoalAttribution(team);
  if (goalInfo[0]) {
    room.setPlayerAvatar(goalInfo[0].id, getRole(goalInfo[0]) >= 3 ? "🌟" : getRole(goalInfo[0]) >= 1 ? "💎" : "🔥");
    if (goalInfo[1]) room.setPlayerAvatar(goalInfo[1].id, "⭐");
    setTimeout(() => {
      room.setPlayerAvatar(goalInfo[0].id, null);
      if (goalInfo[1]) room.setPlayerAvatar(goalInfo[1].id, null);
    }, 3000);
  }
};

room.onTeamVictory = function(scores) {
  // Manejado en endGame() via checkTime() y onTeamGoal()
};

room.onGameTick = function() {
  checkTime();
  getLastTouchOfTheBall();
  getGameStats();
  handleActivity();
  handleAvatarMovement();
  calculateStadiumVariables();

  // Mecánicas avanzadas
  handleAdvancedInput();
};

// =============================================================================
//  Mecánicas Avanzadas: Power Bar + Sliding
// =============================================================================

// Mapas de control
const powerChargeMap = new Map();   // Power Bar
const slideCooldown = new Map();    // Tiempo hasta que el jugador puede volver a usar slide
const slideState = new Map();       // Estado actual del slide: { elapsed, dirX, dirY }

// Configuración del Sliding
const SLIDE_DURATION_TICKS = 12;   // ~200 ms a 60 ticks/s
const SLIDE_SPEED = 8;             // Impulso base
const SLIDE_COOLDOWN_MS = 3000;    // 3 segundos

function handleAdvancedInput() {
  const players = room.getPlayerList().filter(p => p.team !== 0);
  const now = Date.now();

  for (const player of players) {
    if (!player.activity) continue;

    // ========== POWER BAR (carga de disparo) ==========
    const isKicking = (player.activity & 16) !== 0;

    if (isKicking) {
      if (!powerChargeMap.has(player.id)) {
        powerChargeMap.set(player.id, { chargeStart: now });
      }
    } else {
      if (powerChargeMap.has(player.id)) {
        const charge = powerChargeMap.get(player.id);
        const holdTime = now - charge.chargeStart;
        if (holdTime >= 400) {
          const multiplier = Math.min(1.5 + (holdTime - 400) / 800 * 1.5, 3.0);
          const disc = room.getPlayerDiscProperties(player.id);
          if (disc) {
            room.setPlayerDiscProperties(player.id, {
              xspeed: disc.xspeed * multiplier,
              yspeed: disc.yspeed * multiplier
            });
            room.sendAnnouncement(
              `💥 ¡Disparo cargado! (${multiplier.toFixed(1)}x)`,
              player.id, 0xff6600, "bold", 1
            );
          }
        }
        powerChargeMap.delete(player.id);
      }
    }

    // ========== SLIDING (W + S simultáneas) ==========
    const pressingW = (player.activity & 1) !== 0;
    const pressingS = (player.activity & 2) !== 0;
    const wantsToSlide = pressingW && pressingS;

    // Si ya está en slide
    if (slideState.has(player.id)) {
      const state = slideState.get(player.id);
      state.elapsed++;

      if (state.elapsed >= SLIDE_DURATION_TICKS || !wantsToSlide) {
        // Termina el slide: frena al jugador
        room.setPlayerDiscProperties(player.id, { xspeed: 0, yspeed: 0 });
        slideState.delete(player.id);
      } else {
        // Mantiene la velocidad de slide
        room.setPlayerDiscProperties(player.id, {
          xspeed: state.dirX * SLIDE_SPEED,
          yspeed: state.dirY * SLIDE_SPEED
        });
      }
      continue;
    }

    // Iniciar slide si presiona W+S y no está en cooldown
    if (wantsToSlide) {
      if (slideCooldown.has(player.id) && now < slideCooldown.get(player.id)) {
        // En cooldown, no hace nada
        continue;
      }

      // Obtiene dirección actual del jugador
      const disc = room.getPlayerDiscProperties(player.id);
      if (!disc) continue;
      let dirX = disc.xspeed;
      let dirY = disc.yspeed;
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      if (len < 0.1) {
        // Si está parado, desliza hacia abajo por defecto
        dirX = 0;
        dirY = 1;
      } else {
        dirX /= len;
        dirY /= len;
      }

      // Activa el slide
      slideState.set(player.id, {
        elapsed: 0,
        dirX: dirX,
        dirY: dirY
      });
      slideCooldown.set(player.id, now + SLIDE_COOLDOWN_MS);
      room.sendAnnouncement(
        "🛼 ¡Slide!",
        player.id, 0x00ccff, "bold", 1
      );
    }
  }

  // Limpieza: eliminar datos de jugadores que ya no están en cancha
  for (const [id] of powerChargeMap) {
    if (!players.some(p => p.id === id)) powerChargeMap.delete(id);
  }
  for (const [id] of slideState) {
    if (!players.some(p => p.id === id)) slideState.delete(id);
  }
  for (const [id] of slideCooldown) {
    if (!players.some(p => p.id === id) && now >= slideCooldown.get(id)) {
      slideCooldown.delete(id);
    }
  }
}

// =============================================================================
//  ARRANQUE INICIAL
// =============================================================================

game = new Game();