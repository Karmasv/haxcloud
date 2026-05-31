// =============================================================================
//  index.js — Punto de entrada de Liga Promeriga - Returns
//
//  Uso:  node index.js
//
//  Orden de carga:
//    1. config    — CONFIG y listas de usuarios
//    2. classes   — clases de datos (Goal, Game, etc.)
//    3. state     — variables globales de runtime
//    4. utils     — funciones de utilidad puras
//    5. roles     — getRole, getAuth, etc.
//    6. stats     — localStorage, XP, rangos
//    7. gameplay  — lógica de partido: toques, goles, porteros
//    8. teams     — lineups, balance, choose mode
//    9. game      — tiempo, golden goal, avatares, inactividad
//   10. webhooks  — todos los webhooks de Discord
//   11. commands  — tabla de comandos + funciones
//   12. events    — room.onPlayerJoin, onGameTick, etc.
// =============================================================================

const HaxballJS = require('haxball.js').default;
const fs        = require('fs');
const path      = require('path');

function loadModule(file) {
  const content = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
  eval(content);
}

// Cargar config primero — necesitamos CONFIG antes de HBInit
loadModule('./config.js');

HaxballJS().then((HBInit) => {

  const room = HBInit({
    roomName:   CONFIG.room.name,
    maxPlayers: CONFIG.room.maxPlayers,
    public:     CONFIG.room.public,
    noPlayer:   CONFIG.room.noPlayer,
    geo:        CONFIG.room.geo,
    token:      CONFIG.token,
  });

  // Con room disponible, cargar el resto
  loadModule('./classes.js');
  loadModule('./state.js');
  loadModule('./utils.js');
  loadModule('./roles.js');
  loadModule('./stats.js');
  loadModule('./gameplay.js');
  loadModule('./teams.js');
  loadModule('./game.js');
  loadModule('./webhooks.js');
  loadModule('./commands.js');
  loadModule('./events.js');

  room.onRoomLink = function(link) {
    console.log('✅ Sala iniciada:', link);
  };

}).catch((err) => {
  console.error('❌ Error al iniciar haxball.js:', err);
  process.exit(1);
});
