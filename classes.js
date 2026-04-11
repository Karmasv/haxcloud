// =============================================================================
//  classes.js — Clases de datos
// =============================================================================

class Goal {
  constructor(time, team, striker, assist) {
    this.time    = time;
    this.team    = team;
    this.striker = striker;
    this.assist  = assist;
  }
}

class Game {
  constructor() {
    this.date       = Date.now();
    this.scores     = room.getScores();
    this.playerComp = getStartingLineups();
    this.goals      = [];
    this.rec        = room.startRecording();
    this.touchArray = [];
  }
}

class PlayerComposition {
  constructor(player, auth, timeEntry, timeExit) {
    this.player          = player;
    this.auth            = auth;
    this.timeEntry       = timeEntry;
    this.timeExit        = timeExit;
    this.inactivityTicks = 0;
    this.GKTicks         = 0;
  }
}

class BallTouch {
  constructor(player, time, goal, position) {
    this.player   = player;
    this.time     = time;
    this.goal     = goal;
    this.position = position;
  }
}

class HaxStatistics {
  constructor(playerName = "") {
    this.playerName = playerName;
    this.games      = 0;
    this.wins       = 0;
    this.losses     = 0;
    this.winrate    = "0.00%";
    this.playtime   = 0;
    this.goals      = 0;
    this.assists    = 0;
    this.CS         = 0;
    this.ownGoals   = 0;
  }
}

class MutePlayer {
  static latestId = 0;

  constructor(name, playerId, auth) {
    this.id            = ++MutePlayer.latestId;
    this.name          = name;
    this.playerId      = playerId;
    this.auth          = auth;
    this.unmuteTimeout = null;
  }

  setDuration(minutes) {
    this.unmuteTimeout = setTimeout(() => {
      room.sendAnnouncement(`🔊 ${this.name} fue desmuteado.`, this.playerId, 0xffefd6, "bold", 1);
      muteArray.removeById(this.id);
    }, minutes * 60 * 1000);
    muteArray.add(this);
  }

  remove() {
    clearTimeout(this.unmuteTimeout);
    muteArray.removeById(this.id);
  }
}

class MuteList {
  constructor() { this.list = []; }
  add(mp)            { this.list.push(mp); return mp; }
  getById(id)        { return this.list.find(m => m.id === id) ?? null; }
  getByPlayerId(pid) { return this.list.find(m => m.playerId === pid) ?? null; }
  getByAuth(auth)    { return this.list.find(m => m.auth === auth) ?? null; }
  removeById(id)     { this.list = this.list.filter(m => m.id !== id); }
  removeByAuth(auth) { this.list = this.list.filter(m => m.auth !== auth); }
}

class SpamDetection {
  constructor() {
    this.threshold   = CONFIG.spam.threshold;
    this.timeWindow  = CONFIG.spam.timeWindow;
    this.maxMessages = CONFIG.spam.maxMessages;
    this.users       = new Map();
  }

  checkSpam(player, message) {
    const now = Date.now();
    if (!this.users.has(player.id)) this.users.set(player.id, []);
    const msgs = this.users.get(player.id);
    msgs.push({ message, timestamp: now });
    while (msgs.length > 0 && msgs[0].timestamp < now - this.timeWindow) msgs.shift();
    if (player.admin) return;
    if (msgs.length > this.maxMessages) {
      room.kickPlayer(player.id, "¡No hagas spam!", false);
      return;
    }
    const last = msgs.slice(-this.threshold);
    if (last.length >= this.threshold && last.every(m => m.message === message)) {
      room.kickPlayer(player.id, "¡No hagas spam!", false);
    }
  }

  removeUser(playerId) { this.users.delete(playerId); }
}

