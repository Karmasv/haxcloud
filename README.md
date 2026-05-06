# HAXCLOUD SCRIPT
## Estructura de archivos

```
haxcloud/
├── index.js        ← Punto de entrada (carga todos los módulos)
├── config.js       ← CONFIG, webhooks, listas de usuarios (owners, admins, etc.)
├── classes.js      ← Clases: Goal, Game, PlayerComposition, MutePlayer, etc.
├── state.js        ← Variables globales de runtime (equipos, gameState, etc.)
├── utils.js        ← Funciones utilitarias (formatTime, getRandomInt, etc.)
├── roles.js        ← Sistema de roles: getRole, getAuth, isAdmin, etc.
├── stats.js        ← localStorage, XP, rangos, calculateScore
├── physics.js      ← Física del juego, toques de balón, goles, porteros
├── teams.js        ← Gestión de equipos, balance automático, choose mode
├── game.js         ← Tiempo, golden goal, avatares, inactividad
├── webhooks.js     ← Todos los webhooks de Discord (5 canales)
├── commands.js     ← Comandos de jugadores, mods, admins y owners
├── events.js       ← Event handlers de HaxBall (onPlayerJoin, onGameTick, etc.)
└── package.json
```

## Cómo correr

```bash
# Directo
node haxball.js index.js

# Con PM2 (recomendado para VPS)
pm2 start haxball.js --name liga-promeriga -- index.js
pm2 save
pm2 startup
```

## Pendiente

- [ ] Integrar el mapa personalizado en `config.js` (variable `MAP_JSON`)
- [ ] Integrar defLines cuando esté el mapa
- [ ] Actualizar el Discord link en `config.js` → `CONFIG.discord`

## Roles

| Rol    | Nivel | Cómo se obtiene              |
|--------|-------|------------------------------|
| Owner  | 4     | `!claimadmin (aqui contraseña)` |
| Admin  | 3     | `!setadmin #ID` (Owner)      |
| Mod    | 2     | `!setmod #ID` (Admin+)       |
| VIP    | 1     | `!setvip #ID` (Admin+)       |

## Sistema de XP y rangos

| Rango         | XP mínima |
|---------------|-----------|
| 🥉 Bronce I   | 0         |
| 🥉 Bronce II  | 200       |
| 🥉 Bronce III | 350       |
| 🥈 Plata I    | 500       |
| 🥈 Plata II   | 750       |
| 🥈 Plata III  | 1.000     |
| 🥇 Oro I      | 1.500     |
| 🥇 Oro II     | 2.200     |
| 🥇 Oro III    | 2.900     |
| 💎 Diamante I | 3.500     |
| 💎 Diamante II| 4.500     |
| 💎 Diamante III| 5.500    |
| 👑 Élite      | 7.000     |

**XP por evento:** Victoria +50 | Derrota -10 | Gol +20 | Asistencia +10 | CS +15 | Autogol -15
