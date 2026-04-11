// =============================================================================
//  index.js — Punto de entrada de Liga Promeriga - Returns
//
//  Uso:  node haxball.js index.js
//
//  Orden de carga (importa respetar):
//    1. config    — CONFIG y listas de usuarios
//    2. classes   — clases de datos (Goal, Game, etc.)
//    3. state     — variables globales de runtime
//    4. utils     — funciones de utilidad puras
//    5. roles     — getRole, getAuth, etc.
//    6. stats     — localStorage, XP, rangos
//    7. gameplay  — lógica de juego: toques, goles, porteros, stats
//    8. teams     — lineups, balance, choose mode
//    9. game      — tiempo, golden goal, avatares, actividad
//   10. webhooks  — todos los webhooks de Discord
//   11. commands  — tabla de comandos + funciones
//   12. events    — room.onPlayerJoin, onGameTick, etc.
// =============================================================================

// HBInit es inyectado por haxball.js antes de este script.
// No importar nada con require() — todo comparte el scope global.

// El orden de los requires a continuación es el único orden válido.
// Si movés un archivo de lugar, asegurate de mantener este orden.

loadModule('./config.js');
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

function loadModule(path) {
  const fs      = require('fs');
  const content = fs.readFileSync(require('path').resolve(__dirname, path), 'utf8');
  // eval en el scope global para que todas las funciones queden disponibles
  // entre módulos (así funciona el headless de HaxBall)
  eval(content);
}
