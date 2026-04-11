'use strict';
// =============================================================================
//  salas/br.js — Brasil x1-x5
//  Idioma: Português | Proxies: Brasil
// =============================================================================

const PROXIES = {
  p1: 'http://user:pass@proxy-brasil-1:puerto',
  p2: 'http://user:pass@proxy-brasil-2:puerto',
  p3: 'http://user:pass@proxy-brasil-3:puerto',
};

module.exports = [
  {
    id:       'br-x1',
    lang:     'pt',
    proxy:    PROXIES.p1,
    token:    'TOKEN_BR_X1',
    room: {
      name:       '💐 Liga Promeriga BR x1',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'br', lat: -14.2350, lon: -51.9253 },
    },
    webhooks: {
      baneos:    'WEBHOOK_BR_X1_BANEOS',
      actividad:    'WEBHOOK_BR_X1_ACTIVIDAD',
      chat:    'WEBHOOK_BR_X1_CHAT',
      soporte:    'WEBHOOK_BR_X1_SOPORTE',
      partidos:    'WEBHOOK_BR_X1_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'br-x2',
    lang:     'pt',
    proxy:    PROXIES.p1,
    token:    'TOKEN_BR_X2',
    room: {
      name:       '💐 Liga Promeriga BR x2',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'br', lat: -14.2350, lon: -51.9253 },
    },
    webhooks: {
      baneos:    'WEBHOOK_BR_X2_BANEOS',
      actividad:    'WEBHOOK_BR_X2_ACTIVIDAD',
      chat:    'WEBHOOK_BR_X2_CHAT',
      soporte:    'WEBHOOK_BR_X2_SOPORTE',
      partidos:    'WEBHOOK_BR_X2_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'br-x3',
    lang:     'pt',
    proxy:    PROXIES.p2,
    token:    'TOKEN_BR_X3',
    room: {
      name:       '💐 Liga Promeriga BR x3',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'br', lat: -14.2350, lon: -51.9253 },
    },
    webhooks: {
      baneos:    'WEBHOOK_BR_X3_BANEOS',
      actividad:    'WEBHOOK_BR_X3_ACTIVIDAD',
      chat:    'WEBHOOK_BR_X3_CHAT',
      soporte:    'WEBHOOK_BR_X3_SOPORTE',
      partidos:    'WEBHOOK_BR_X3_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'br-x4',
    lang:     'pt',
    proxy:    PROXIES.p2,
    token:    'TOKEN_BR_X4',
    room: {
      name:       '💐 Liga Promeriga BR x4',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'br', lat: -14.2350, lon: -51.9253 },
    },
    webhooks: {
      baneos:    'WEBHOOK_BR_X4_BANEOS',
      actividad:    'WEBHOOK_BR_X4_ACTIVIDAD',
      chat:    'WEBHOOK_BR_X4_CHAT',
      soporte:    'WEBHOOK_BR_X4_SOPORTE',
      partidos:    'WEBHOOK_BR_X4_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  },
  {
    id:       'br-x5',
    lang:     'pt',
    proxy:    PROXIES.p3,
    token:    'TOKEN_BR_X5',
    room: {
      name:       '💐 Liga Promeriga BR x5',
      maxPlayers: 28,
      public:     true,
      noPlayer:   true,
      geo:        { code: 'br', lat: -14.2350, lon: -51.9253 },
    },
    webhooks: {
      baneos:    'WEBHOOK_BR_X5_BANEOS',
      actividad:    'WEBHOOK_BR_X5_ACTIVIDAD',
      chat:    'WEBHOOK_BR_X5_CHAT',
      soporte:    'WEBHOOK_BR_X5_SOPORTE',
      partidos:    'WEBHOOK_BR_X5_PARTIDOS',
    },
    discord: 'https://discord.gg/TU_SERVER',
  }
];
