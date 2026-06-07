'use strict';
// =============================================================================
//  uniforms.js — Uniformes de selecciones y clubes 
// =============================================================================

module.exports = [
  // ─── SELECCIONES CONMEBOL ─────────────────────────────────────────────────
  { name: 'Argentina',     red: { angle: 0, textColor: 0, colors: [16777215, 3881343, 16777215] }, blue: { angle: 90, textColor: 16777215, colors: [12434877, 2031710, 3088527, 4456649] } },
  { name: 'Brasil',        red: { angle: 90, textColor: 0, colors: [1637726, 15238905] }, blue: { angle: 90, textColor: 16777215, colors: [1637726, 2712065] } },
  { name: 'Uruguay',       red: { angle: 90, textColor: 0, colors: [16762424, 39423] }, blue: { angle: 90, textColor: 16777215, colors: [0, 16777215] } },
  { name: 'Chile',         red: { angle: 90, textColor: 0, colors: [16777215, 16714243] }, blue: { angle: 90, textColor: 16777215, colors: [1856073, 16777215] } },
  { name: 'Paraguay',      red: { angle: 0, textColor: 16777215, colors: [397110, 16777215, 15855635, 16777215] }, blue: { angle: 0, textColor: 0, colors: [15138796, 397110] } },
  { name: 'Colombia',      red: { angle: 0, textColor: 0, colors: [592699, 16775188] }, blue: { angle: 0, textColor: 16777215, colors: [16777215, 16711680, 10027008, 5046272] } },
  { name: 'Perú',          red: { angle: 44, textColor: 16777215, colors: [0, 16777215, 16711680, 16512245] }, blue: { angle: 44, textColor: 0, colors: [16777215, 12517376, 16711680, 12517376] } },
  { name: 'Ecuador',       red: { angle: 90, textColor: 0, colors: [789301, 16777019, 15564599, 16777019] }, blue: { angle: 0, textColor: 16777215, colors: [16119546, 1651089, 1455741, 1651089] } },
  { name: 'Bolivia',       red: { angle: 0, textColor: 16777215, colors: [16119546, 4318270] }, blue: { angle: 0, textColor: 16777215, colors: [16119546, 16720159] } },
  { name: 'Venezuela',     red: { angle: 0, textColor: 16777215, colors: [16119546, 8392848] }, blue: { angle: 0, textColor: 16777215, colors: [7212558, 16777215] } },

  // ─── SELECCIONES CONCACAF ─────────────────────────────────────────────────
  { name: 'México',        red: { angle: 0, textColor: 0, colors: [16777215, 10027008, 16777215] }, blue: { angle: 60, textColor: 16777215, colors: [0, 16711680, 16777215] } },
  { name: 'USA',           red: { angle: 0, textColor: 16777215, colors: [16777215, 311, 11665408] }, blue: { angle: 90, textColor: 16777215, colors: [16711680, 16777215, 311] } },
  { name: 'Canadá',        red: { angle: 60, textColor: 16777215, colors: [16711680, 16777215] }, blue: { angle: 0, textColor: 0, colors: [16711680, 16777215] } },
  { name: 'Costa Rica',    red: { angle: 90, textColor: 16777215, colors: [16711680, 0, 16777215] }, blue: { angle: 60, textColor: 16777215, colors: [16777215, 311, 0] } },
  { name: 'El Salvador',   red: { angle: 0, textColor: 16777215, colors: [0, 16777215, 0] }, blue: { angle: 90, textColor: 16777215, colors: [16777215, 0, 16777215] } },

  // ─── SELECCIONES EUROPA ──────────────────────────────────────────────────
  { name: 'España',        red: { angle: 90, textColor: 0, colors: [16711680, 16775188, 16711680] }, blue: { angle: 0, textColor: 16777215, colors: [16775188, 16711680] } },
  { name: 'Francia',       red: { angle: 60, textColor: 16777215, colors: [311, 11665408, 16777215] }, blue: { angle: 0, textColor: 16777215, colors: [16777215, 311, 11665408] } },
  { name: 'Alemania',      red: { angle: 0, textColor: 0, colors: [16777215, 0, 16711680] }, blue: { angle: 90, textColor: 16777215, colors: [0, 16711680, 16775188] } },
  { name: 'Italia',        red: { angle: 90, textColor: 16777215, colors: [311, 11665408, 16777215] }, blue: { angle: 60, textColor: 16777215, colors: [16777215, 311, 11665408] } },
  { name: 'Inglaterra',    red: { angle: 0, textColor: 16777215, colors: [16777215, 0, 16777215] }, blue: { angle: 90, textColor: 16777215, colors: [0, 16777215, 16711680] } },
  { name: 'Portugal',      red: { angle: 60, textColor: 0, colors: [16711680, 10027008, 16777215] }, blue: { angle: 0, textColor: 16777215, colors: [10027008, 16777215, 16711680] } },
  { name: 'Países Bajos',  red: { angle: 90, textColor: 0, colors: [16711680, 16777215, 0] }, blue: { angle: 60, textColor: 16777215, colors: [16777215, 16711680, 311] } },
  { name: 'Bélgica',       red: { angle: 0, textColor: 16777215, colors: [16711680, 16775188, 0] }, blue: { angle: 90, textColor: 16777215, colors: [0, 16711680, 16775188] } },
  { name: 'Croacia',       red: { angle: 60, textColor: 16777215, colors: [16777215, 16711680, 311] }, blue: { angle: 0, textColor: 16777215, colors: [16711680, 16777215, 0] } },

  // ─── PREMIER LEAGUE ─────────────────────────────────────────────────────
  { name: 'Arsenal',       red: { angle: 0, textColor: 16777215, colors: [16711680, 16777215, 0] }, blue: { angle: 90, textColor: 16777215, colors: [16775188, 0, 16711680] } },
  { name: 'Chelsea',       red: { angle: 90, textColor: 16777215, colors: [311, 11665408, 16777215] }, blue: { angle: 0, textColor: 0, colors: [16777215, 311, 11665408] } },
  { name: 'Liverpool',     red: { angle: 60, textColor: 16777215, colors: [16711680, 16775188, 0] }, blue: { angle: 0, textColor: 16777215, colors: [0, 16711680, 16775188] } },
  { name: 'Man City',      red: { angle: 0, textColor: 16777215, colors: [311, 11665408, 16777215] }, blue: { angle: 90, textColor: 0, colors: [16777215, 311, 11665408] } },
  { name: 'Man United',    red: { angle: 60, textColor: 0, colors: [16711680, 0, 16775188] }, blue: { angle: 0, textColor: 16777215, colors: [0, 16775188, 16711680] } },
  { name: 'Tottenham',     red: { angle: 0, textColor: 16777215, colors: [16777215, 311, 11665408] }, blue: { angle: 90, textColor: 16777215, colors: [311, 11665408, 16777215] } },

  // ─── LA LIGA ────────────────────────────────────────────────────────────
  { name: 'Real Madrid',   red: { angle: 0, textColor: 16777215, colors: [16777215, 311, 11665408] }, blue: { angle: 60, textColor: 16777215, colors: [311, 11665408, 16777215] } },
  { name: 'Barcelona',     red: { angle: 90, textColor: 0, colors: [16711680, 311, 16775188] }, blue: { angle: 60, textColor: 16777215, colors: [311, 16775188, 16711680] } },
  { name: 'Atlético',      red: { angle: 60, textColor: 16777215, colors: [16711680, 16777215, 311] }, blue: { angle: 0, textColor: 0, colors: [16777215, 16711680, 0] } },
  { name: 'Sevilla',       red: { angle: 0, textColor: 16777215, colors: [16777215, 16711680, 0] }, blue: { angle: 90, textColor: 16777215, colors: [16711680, 0, 16777215] } },

  // ─── SERIE A ────────────────────────────────────────────────────────────
  { name: 'Juventus',      red: { angle: 0, textColor: 0, colors: [16777215, 0, 16775188] }, blue: { angle: 90, textColor: 16777215, colors: [0, 16775188, 16777215] } },
  { name: 'AC Milan',      red: { angle: 60, textColor: 16777215, colors: [16711680, 0, 16775188] }, blue: { angle: 0, textColor: 16777215, colors: [0, 16775188, 16711680] } },
  { name: 'Inter',         red: { angle: 90, textColor: 16777215, colors: [311, 11665408, 0] }, blue: { angle: 60, textColor: 16777215, colors: [0, 311, 11665408] } },
  { name: 'Napoli',        red: { angle: 60, textColor: 0, colors: [311, 11665408, 16777215] }, blue: { angle: 0, textColor: 16777215, colors: [16777215, 311, 11665408] } },

  // ─── BUNDESLIGA ────────────────────────────────────────────────────────
  { name: 'Bayern',        red: { angle: 0, textColor: 16777215, colors: [16711680, 16777215, 311] }, blue: { angle: 90, textColor: 0, colors: [16777215, 16711680, 0] } },
  { name: 'Dortmund',      red: { angle: 90, textColor: 16777215, colors: [16711680, 0, 16775188] }, blue: { angle: 60, textColor: 16777215, colors: [0, 16775188, 16711680] } },

  // ─── LIGUE 1 ────────────────────────────────────────────────────────────
  { name: 'PSG',           red: { angle: 90, textColor: 0, colors: [311, 11665408, 16711680] }, blue: { angle: 0, textColor: 16777215, colors: [16711680, 311, 11665408] } },
  { name: 'Marsella',      red: { angle: 0, textColor: 16777215, colors: [16777215, 311, 16775188] }, blue: { angle: 90, textColor: 16777215, colors: [311, 16775188, 16777215] } },

  // ─── EREDIVISIE ────────────────────────────────────────────────────────
  { name: 'Ajax',          red: { angle: 60, textColor: 16777215, colors: [16777215, 16711680, 0] }, blue: { angle: 0, textColor: 0, colors: [16711680, 16777215, 311] } },
  { name: 'PSV',           red: { angle: 90, textColor: 0, colors: [16711680, 16777215, 311] }, blue: { angle: 60, textColor: 16777215, colors: [16777215, 311, 16711680] } },
];
