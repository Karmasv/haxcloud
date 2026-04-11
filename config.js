// =============================================================================
//  config.js — Configuración central y listas de usuarios
// =============================================================================

const CONFIG = {
  // Token de HaxBall — obtenelo en: https://www.haxball.com/headlesstoken
  token: "TU_TOKEN_AQUI",

  room: {
    name:       "💐 Liga Promeriga - Returns",
    maxPlayers: 28,
    public:     true,
    noPlayer:   true,
    geo:        { code: "co", lat: 5.6001, lon: -75.0817 },
  },
  game: {
    scoreLimit:  3,
    timeLimit:   4,
    kickRate:    { min: 6, rate: 0, burst: 0 },
    teamsLocked: true,
  },
  webhooks: {
    recordings: "https://discord.com/api/webhooks/1490447898826248363/7N0UbQRFH_20lGGzA7WLGcWwoax-uUa8ZUoJCcrCLbBD9e0Nygvo1z7tFF-TGxZWW523",
    summary:    "https://discord.com/api/webhooks/1490447898826248363/7N0UbQRFH_20lGGzA7WLGcWwoax-uUa8ZUoJCcrCLbBD9e0Nygvo1z7tFF-TGxZWW523",
    baneos:     "https://discord.com/api/webhooks/1490447885962182767/KKCI5TB62zJawvvbLZ0RLf85iEcauRy5rpkdgottiYKq5KQdChX3zAFY50BH_V7hMJCO",
    actividad:  "https://discord.com/api/webhooks/1490447888676028547/77eXlsbM1WkCKNdxWYRmq8nVT2G5-wpGVOsqHmVVoGGeaP3CqSryVTdw6jRuzpd4kvGN",
    chat:       "https://discord.com/api/webhooks/1490447891406389371/1Ee0bIhSKy-FSP82qSLPZEPgyNvrYSlipUVJMTjNfZuxbUVEAZEJTwjPSZrF5UuA1olf",
    soporte:    "https://discord.com/api/webhooks/1490447894283813077/bEoCg9jzEF2-NHKbXccRWpQyJFYNMRv178WlFCjNkouPocN2k0eY4ybSv4AQwFpQR7yo",
  },
  discord:       "DISCORD_LINK_AQUI",
  claimPassword: "k3Rn3l.d3Ve10p3r",
  vipLockAt:     25,
  vipPassword:   "0666",
  inactivityWarnAt: 800,
  inactivityKickAt: 1200,
  spam: { threshold: 6, timeWindow: 1000, maxMessages: 8 },
  cooldowns: {
    sub:        300_000,
    afk:      1_800_000,
    anonMsg:    900_000,
    jumpVip:  3_600_000,
    jumpMod:  1_800_000,
  },
  stats: {
    minPlayers:        8,
    minPlayersPerTeam: 4,
    minTimeRatio:      0.8333,
  },
};

// Listas de usuarios — Roles: 4=Owner, 3=Admin, 2=Mod, 1=VIP, 0=jugador
let ownerList = [];
let adminList = [];
let modList   = [];
let vipList   = [];
const blackList = [];
