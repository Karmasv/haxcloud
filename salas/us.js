'use strict';
// =============================================================================
//  salas/us.js — USA x1-x5
//  Idioma: English | Proxies: USA
// =============================================================================

const PROXIES = {
  p1: 'http://user:pass@proxy-usa-1:puerto',
  p2: 'http://user:pass@proxy-usa-2:puerto',
  p3: 'http://user:pass@proxy-usa-3:puerto',
};

module.exports = [
  {
    id:       'us-x1',
    lang:     'en',
    proxy:    PROXIES.p1,
    token:    'TOKEN_US_X1',
    room: {
      name:       '💐 Liga Promeriga USA x1',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'us', lat: 37.0902, lon: -95.7129 },
    },
    webhooks: {
      baneos:    'WEBHOOK_US_X1_BANEOS',
      actividad:    'WEBHOOK_US_X1_ACTIVIDAD',
      chat:    'WEBHOOK_US_X1_CHAT',
      soporte:    'WEBHOOK_US_X1_SOPORTE',
      partidos:    'WEBHOOK_US_X1_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'us-x2',
    lang:     'en',
    proxy:    PROXIES.p1,
    token:    'TOKEN_US_X2',
    room: {
      name:       '💐 Liga Promeriga USA x2',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'us', lat: 37.0902, lon: -95.7129 },
    },
    webhooks: {
      baneos:    'WEBHOOK_US_X2_BANEOS',
      actividad:    'WEBHOOK_US_X2_ACTIVIDAD',
      chat:    'WEBHOOK_US_X2_CHAT',
      soporte:    'WEBHOOK_US_X2_SOPORTE',
      partidos:    'WEBHOOK_US_X2_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'us-x3',
    lang:     'en',
    proxy:    PROXIES.p2,
    token:    'TOKEN_US_X3',
    room: {
      name:       '💐 Liga Promeriga USA x3',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'us', lat: 37.0902, lon: -95.7129 },
    },
    webhooks: {
      baneos:    'WEBHOOK_US_X3_BANEOS',
      actividad:    'WEBHOOK_US_X3_ACTIVIDAD',
      chat:    'WEBHOOK_US_X3_CHAT',
      soporte:    'WEBHOOK_US_X3_SOPORTE',
      partidos:    'WEBHOOK_US_X3_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'us-x4',
    lang:     'en',
    proxy:    PROXIES.p2,
    token:    'TOKEN_US_X4',
    room: {
      name:       '💐 Liga Promeriga USA x4',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'us', lat: 37.0902, lon: -95.7129 },
    },
    webhooks: {
      baneos:    'WEBHOOK_US_X4_BANEOS',
      actividad:    'WEBHOOK_US_X4_ACTIVIDAD',
      chat:    'WEBHOOK_US_X4_CHAT',
      soporte:    'WEBHOOK_US_X4_SOPORTE',
      partidos:    'WEBHOOK_US_X4_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'us-x5',
    lang:     'en',
    proxy:    PROXIES.p3,
    token:    'TOKEN_US_X5',
    room: {
      name:       '💐 Liga Promeriga USA x5',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'us', lat: 37.0902, lon: -95.7129 },
    },
    webhooks: {
      baneos:    'WEBHOOK_US_X5_BANEOS',
      actividad:    'WEBHOOK_US_X5_ACTIVIDAD',
      chat:    'WEBHOOK_US_X5_CHAT',
      soporte:    'WEBHOOK_US_X5_SOPORTE',
      partidos:    'WEBHOOK_US_X5_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  }
];