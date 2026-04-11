'use strict';
// =============================================================================
//  salas/co.js — Colombia x1-x5
//  Idioma: Español | Proxies: USA
// =============================================================================

// 5 salas — 3 proxies USA (2 salas/proxy) + IP VPS (sala x5)
// Completar con tus proxies de WebShare.io
const PROXIES = {
  p1: 'http://user:pass@proxy-usa-1:puerto',
  p2: 'http://user:pass@proxy-usa-2:puerto',
  p3: 'http://user:pass@proxy-usa-3:puerto',
};

module.exports = [
  {
    id:       'co-x1',
    lang:     'es',
    proxy:    PROXIES.p1,
    token:    'TOKEN_CO_X1',
    room: {
      name:       '💐 Liga Promeriga CO x1',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'co', lat: 4.7110, lon: -74.0721 },
    },
    webhooks: {
      baneos:    'WEBHOOK_CO_X1_BANEOS',
      actividad: 'WEBHOOK_CO_X1_ACTIVIDAD',
      chat:      'WEBHOOK_CO_X1_CHAT',
      soporte:   'WEBHOOK_CO_X1_SOPORTE',
      partidos:  'WEBHOOK_CO_X1_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'co-x2',
    lang:     'es',
    proxy:    PROXIES.p1,
    token:    'TOKEN_CO_X2',
    room: {
      name:       '💐 Liga Promeriga CO x2',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'co', lat: 4.7110, lon: -74.0721 },
    },
    webhooks: {
      baneos:    'WEBHOOK_CO_X2_BANEOS',
      actividad: 'WEBHOOK_CO_X2_ACTIVIDAD',
      chat:      'WEBHOOK_CO_X2_CHAT',
      soporte:   'WEBHOOK_CO_X2_SOPORTE',
      partidos:  'WEBHOOK_CO_X2_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'co-x3',
    lang:     'es',
    proxy:    PROXIES.p2,
    token:    'TOKEN_CO_X3',
    room: {
      name:       '💐 Liga Promeriga CO x3',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'co', lat: 4.7110, lon: -74.0721 },
    },
    webhooks: {
      baneos:    'WEBHOOK_CO_X3_BANEOS',
      actividad: 'WEBHOOK_CO_X3_ACTIVIDAD',
      chat:      'WEBHOOK_CO_X3_CHAT',
      soporte:   'WEBHOOK_CO_X3_SOPORTE',
      partidos:  'WEBHOOK_CO_X3_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'co-x4',
    lang:     'es',
    proxy:    PROXIES.p2,
    token:    'TOKEN_CO_X4',
    room: {
      name:       '💐 Liga Promeriga CO x4',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'co', lat: 4.7110, lon: -74.0721 },
    },
    webhooks: {
      baneos:    'WEBHOOK_CO_X4_BANEOS',
      actividad: 'WEBHOOK_CO_X4_ACTIVIDAD',
      chat:      'WEBHOOK_CO_X4_CHAT',
      soporte:   'WEBHOOK_CO_X4_SOPORTE',
      partidos:  'WEBHOOK_CO_X4_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'co-x5',
    lang:     'es',
    proxy:    PROXIES.p3,
    token:    'TOKEN_CO_X5',
    room: {
      name:       '💐 Liga Promeriga CO x5',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'co', lat: 4.7110, lon: -74.0721 },
    },
    webhooks: {
      baneos:    'WEBHOOK_CO_X5_BANEOS',
      actividad: 'WEBHOOK_CO_X5_ACTIVIDAD',
      chat:      'WEBHOOK_CO_X5_CHAT',
      soporte:   'WEBHOOK_CO_X5_SOPORTE',
      partidos:  'WEBHOOK_CO_X5_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
];
