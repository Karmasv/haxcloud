// =============================================================================
//  config.js — Configuración central y listas de usuarios
// =============================================================================

const CONFIG = {
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
  discord:     "DISCORD_LINK_AQUI",
  // Contraseña para reclamar Owner desde el chat
  claimPassword: "k3Rn3l.d3Ve10p3r",
  // Slots a partir de los cuales se pone contraseña VIP
  vipLockAt:   25,
  vipPassword: "0666",
  // Inactividad (ticks a 60/seg)
  inactivityWarnAt: 800,
  inactivityKickAt: 1200,
  // Spam
  spam: { threshold: 6, timeWindow: 1000, maxMessages: 8 },
  // Cooldowns en ms
  cooldowns: {
    sub:        300_000,   // 5 min
    afk:      1_800_000,   // 30 min
    anonMsg:    900_000,   // 15 min
    jumpVip:  3_600_000,   // 1 hora
    jumpMod:  1_800_000,   // 30 min
  },
  stats: {
    minPlayers:        8,
    minPlayersPerTeam: 4,
    minTimeRatio:      0.8333,
  },
};


// Listas de usuarios
// Roles: 4=Owner, 3=Admin, 2=Mod, 1=VIP, 0=jugador
// Formato: [auth, nombre]
let ownerList = [];
let adminList = [];
let modList   = [];
let vipList   = [];
const blackList = [];
