'use strict';
// =============================================================================
//  i18n/es.js — Español (Colombia, Costa Rica)
// =============================================================================
module.exports = {
  // ── Bienvenida ──────────────────────────────────────────────────────────────
  welcome_bar1:    (name) => `━━━━━━━━  💐 LIGA PROMERIGA - RETURNS  ━━━━━━━━`,
  welcome_bar2:    ()     => `          Sala Pública Oficial de la Liga`,
  welcome_bar3:    ()     => `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  welcome_msg:     (name) => `👋 ¡Bienvenido, ${name}! Escribe '!help' para ver los comandos.`,
  welcome_discord: (link) => `💐 Discord: ${link}`,

  // ── Roles ───────────────────────────────────────────────────────────────────
  role_owner:   '👑 Owner',
  role_admin:   '🌟 Admin',
  role_mod:     '🛡️ Mod',
  role_vip:     '💎 VIP',
  role_player:  'Jugador',
  role_invited: 'Invitado',

  // ── Conexiones ──────────────────────────────────────────────────────────────
  joined_owner:   (name) => `👑 ${name} (Owner) se conectó.`,
  joined_admin:   (name) => `🌟 ${name} (Admin) se conectó.`,
  joined_mod:     (name) => `🛡️ ${name} (Mod) se conectó.`,
  joined_vip:     (name) => `💎 ${name} (VIP) se conectó.`,
  blacklist_ban:  (name) => `🔨 ${name} está en la blacklist y fue baneado.`,
  blacklist_msg:  (link) => `Baneado permanentemente. Apelar en: ${link}`,

  // ── Sala llena ──────────────────────────────────────────────────────────────
  vip_lock:       (cur, max) => `💎 Sala casi llena (${cur}/${max}). Solo pueden entrar VIPs.`,
  vip_unlock:     ()         => `✅ Sala abierta al público nuevamente.`,

  // ── Partido ─────────────────────────────────────────────────────────────────
  win_prob_title: () => `⚔️ Probabilidades de victoria:`,
  win_prob_line:  (r, b) => `🔴 RED: ${r}%  |  🔵 BLUE: ${b}%`,
  result_bar1:    () => `━━━━━━━━━  💐 LIGA PROMERIGA  ━━━━━━━━━`,
  result_score:   (r, b) => `⚽ Resultado: 🔴 ${r} - ${b} 🔵`,
  result_poss:    (r, b) => `📊 Posesión: 🔴 ${r}% | 🔵 ${b}%`,
  result_zone:    (r, b) => `📍 Zona:     🔴 ${r}% | 🔵 ${b}%`,
  result_streak:  (n)    => `🔥 Racha: ${n} partidas seguidas`,
  result_draw:    ()     => `⏱️ Tiempo agotado — empate`,
  golden_goal:    ()     => `⚡ ¡GOLDEN GOAL! El próximo gol decide el partido.`,
  ragequit:       ()     => `🤡 Ragequit detectado, partido finalizado.`,
  restart_msg:    ()     => `🔃 Partido reiniciado.`,
  swap_msg:       ()     => `🔄 Equipos intercambiados.`,

  // ── Goles ───────────────────────────────────────────────────────────────────
  goal_team:      (team, speed) => `⚽ Gol para ${team === 1 ? '🔴 Rojo' : '🔵 Azul'} • ${speed}`,
  goal_solo:      (name, phrase, speed) => `⚽ ${name}, ${phrase} • ${speed}`,
  goal_assist:    (name, phrase, assist, speed) => `⚽ ${name}, ${phrase} ${assist} • ${speed}`,
  own_goal:       (phrase, speed) => `🐸 ${phrase} • ${speed}`,
  cs_one:         (name) => `🧤 Clean Sheet: ${name} no recibió goles`,
  cs_two:         (a, b) => `🧱 Clean Sheet: ${a} y ${b} mantuvieron su arco en cero`,

  // ── Frases de gol ───────────────────────────────────────────────────────────
  phrases_assist: ['gran pared con','jugada armada junto a','toque preciso de','asistencia de','combinación con'],
  phrases_solo:   ['definición con categoría','remate preciso','gol bien trabajado','la mandó a guardar','sin dudarlo'],
  phrases_og:     ['{} se equivocó feo','{} regaló el balón','Error grave de {}','{} quedó retratado','{} se durmió'],

  // ── Inactividad ─────────────────────────────────────────────────────────────
  inactivity_warn: (name) => `⚠️ ${name}, si no te movés en los próximos segundos serás expulsado por inactividad.`,
  inactivity_kick: () => 'Expulsado por inactividad',

  // ── AFK ────────────────────────────────────────────────────────────────────
  afk_already_spec: () => '¡Ya sos espectador!',
  afk_already_afk:  () => '¡Ya estás AFK!',
  afk_gone:         (name) => `😴 ${name} se fue AFK.`,
  afk_back:         (name) => `✅ ${name} volvió.`,
  afk_cooldown:     (m, s) => `⏱️ Cooldown: ${m}m ${s}s`,
  afk_cant_losing:  () => '¡No puedes irte AFK mientras tu equipo va perdiendo!',
  afk_list_empty:   () => '😴 No hay nadie AFK.',
  afk_list:         (names) => `😴 AFK: ${names}`,
  sub_wait:         () => '⏱️ Debes esperar antes de usar !sub de nuevo.',

  // ── Comandos generales ──────────────────────────────────────────────────────
  cmd_help_intro:   () => '📖 Comandos disponibles:',
  cmd_help_vip:     () => '💎 VIP:',
  cmd_help_mod:     () => '🛡️ Mod:',
  cmd_help_admin:   () => '🌟 Admin:',
  cmd_help_owner:   () => '👑 Owner:',
  cmd_help_tip:     () => "\n💡 Usa '!help <comando>' para más detalles.",
  cmd_invalid_player: () => '❌ Jugador no válido',
  cmd_no_self_msg:  () => '❌ No puedes enviarte mensajes a ti mismo.',
  cmd_not_found:    () => '❌ Jugador no encontrado!',
  cmd_no_perm:      () => '¡No tenés autorización para banear!',
  discord_title:    () => '💐 LIGA PROMERIGA - RETURNS',
  discord_subtitle: () => 'Servidor oficial de Discord:',
  leave_msg:        () => '👋 ¡Hasta luego!',
  avatar_on:        () => '🔃 Indicadores de movimiento activados.',
  avatar_off:       () => '🔃 Indicadores de movimiento desactivados.',
  jump_vip_only:    () => '💎 Comando exclusivo para VIP y superiores.',
  jump_spec_only:   () => '¡Debes ser espectador para saltar la fila!',
  jump_game_only:   () => '¡Solo podés saltar durante un partido activo!',
  jump_cooldown:    (m, s) => `⏱️ Cooldown: ${m}m ${s}s`,
  jump_done:        (name) => `💎 ¡${name} pasó al primer lugar de la fila!`,
  anon_cooldown:    (m, s) => `⏱️ Cooldown: ${m}m ${s}s`,
  anon_empty:       () => '❌ Escribe un mensaje después de !anon.',
  anon_msg:         (text) => `👻 Anónimo: ${text}`,
  rename_empty:     () => '❌ Escribe el nuevo nombre después del comando.',
  rename_done:      (name) => `✅ Nombre en estadísticas cambiado a: ${name}`,

  // ── Stats ───────────────────────────────────────────────────────────────────
  stats_line1:   (name, g, w, l, wr) => `📋 ${name} — Partidos: ${g} | 🏆 ${w}W 😵 ${l}L | 📊 ${wr}`,
  stats_line2:   (g, a, cs, og, sc, pt) => `⚽ ${g}G ⭐ ${a}A 🧤 ${cs}CS 🐸 ${og}OG | 💎 Score: ${sc} | ⏱️ ${pt}`,
  stats_share:   (name) => `🏆 ${name} comparte sus stats:`,
  stats_reset:   () => '✅ Tus estadísticas fueron reseteadas.',
  top_empty:     () => '¡Aún no hay suficientes partidos registrados!',
  top_header:    () => `━━━━━━━  💎 TOP 5  💎  ━━━━━━━`,
  top_footer:    () => `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,

  // ── XP ──────────────────────────────────────────────────────────────────────
  xp_line1:      (name, rango, nivel) => `✨ ${name} — ${rango} (Nivel ${nivel})`,
  xp_line2:      (xp, prog) => `XP Total: ${xp} | ${prog}`,
  xp_progress:   (cur, max, next) => `${cur}/${max} XP para ${next}`,
  xp_max:        () => '¡Rango máximo!',
  xp_rankup:     (name, rango, xp) => `🎉 ¡${name} subió a ${rango}! (${xp} XP)`,

  // ── Votekick ────────────────────────────────────────────────────────────────
  vote_active:   () => '¡Ya hay una votación activa!',
  vote_usage:    () => '❌ Uso: !votekick #ID',
  vote_invalid:  () => '¡Jugador inválido!',
  vote_no_mod:   () => '¡No podés votar para expulsar a un Mod o superior!',
  vote_start:    (by, target, cur, req) => `🗳️ ${by} inició votación para expulsar a ${target}.\nEscribí '!vote' para votar. (${cur}/${req})`,
  vote_expired:  (target) => `🗳️ Votación para expulsar a ${target} expiró.`,
  vote_no_active:() => '¡No hay ninguna votación activa!',
  vote_already:  () => '¡Ya votaste!',
  vote_progress: (name, cur, req) => `🗳️ ${name} votó. (${cur}/${req})`,
  vote_kicked:   (name) => `✅ ${name} fue expulsado por votación.`,

  // ── Calladmin ───────────────────────────────────────────────────────────────
  calladmin_msg: (name) => `🆘 ${name} necesita un administrador.`,

  // ── Mod/Admin ───────────────────────────────────────────────────────────────
  mute_usage:    () => '❌ Uso: !mute #ID [minutos]',
  mute_already:  () => '¡El jugador ya está muteado!',
  mute_rank:     () => '¡No podés mutear a alguien de tu rango o superior!',
  mute_done:     (name, min) => `🔇 ${name} fue muteado por ${min} minutos.`,
  unmute_done:   (name) => `🔊 ${name} fue desmuteado.`,
  unmute_notfound:() => '¡Jugador no encontrado en la lista de muteados!',
  mute_empty:    () => '🔇 No hay nadie muteado.',
  mute_list:     (list) => `🔇 Muteados: ${list}`,
  setvip_done:   (name) => `💎 ¡${name} ahora es VIP de Liga Promeriga!`,
  setvip_already:() => '¡El jugador ya es VIP!',
  removevip_done:(name) => `💎 ${name} ya no es VIP.`,
  removevip_nf:  () => '¡VIP no encontrado!',
  vip_empty:     () => '💎 No hay jugadores VIP.',
  vip_list:      (list) => `💎 VIPs: ${list}`,
  setmod_done:   (name) => `🛡️ ${name} ahora es Moderador.`,
  setmod_already:() => '¡El jugador ya es Mod!',
  removemod_done:(name) => `🛡️ ${name} ya no es Moderador.`,
  setadmin_done: (name) => `🌟 ${name} ahora es Administrador.`,
  setadmin_already:() => '¡El jugador ya es Admin!',
  removeadmin_done:(name) => `🌟 ${name} ya no es Administrador.`,
  admin_none:    () => 'No hay staff registrado.',
  clearbans_all: () => '✅ Todos los baneos removidos.',
  clearbans_one: (name) => `✅ ${name} fue desbaneado.`,
  clearbans_inv: () => '¡Número inválido!',
  bans_empty:    () => '🔨 No hay nadie baneado.',
  bans_list:     (list) => `🔨 Baneados: ${list}`,
  password_set:  (pwd) => `🔑 Contraseña: ${pwd}`,
  password_rm:   () => '🔑 Contraseña removida.',
  slowmode_msg:  (n) => `🐢 Modo lento: ${n} segundos`,
  slowmode_off:  () => '🐢 Modo lento: desactivado',
  owner_claimed: (name) => `👑 ${name} es ahora Owner de la sala.`,
  owner_relogin: () => '✅ Admin de sala reactivado.',
  owner_wrong:   () => '❌ Contraseña incorrecta.',

  // ── Choose mode ─────────────────────────────────────────────────────────────
  choose_pick:   () => "📖 Elegí un jugador por número, 'top', 'random' o 'bottom'",
  choose_10s:    () => '⏱️ ¡10 segundos para elegir!',
  choose_timeout:() => 'No elegiste a tiempo.',
  choose_list:   (list) => `📃 Fila: ${list}`,
  choose_done:   (cap, pick) => `✅ ${cap} eligió a ${pick}`,
  choose_invalid:() => '¡Número inválido!',

  // ── Ghost kick ──────────────────────────────────────────────────────────────
  ghost_kick:    () => '👻 Ghost kick',

  // ── Descanso obligatorio ────────────────────────────────────────────────────
  ragequit_kick: () => '⚠️ DESCANSO OBLIGATORIO | Se te ha dado un descanso de 1 min por salirte durante un partido perdiendo.',

  // ── Webhooks ────────────────────────────────────────────────────────────────
  wh_ban_title:      () => '👢 Registro de Expulsión 👢',
  wh_ban_player:     (name, auth) => `Jugador Expulsado: ${name} [a.i] (Auth: ${auth} )`,
  wh_ban_by:         (name, auth) => `Realizado por: ${name} (Auth: ${auth})`,
  wh_ban_reason:     (r) => `Razón: ${r ?? 'Sin razón'}`,
  wh_ban_permanent:  (b) => `¿Es Baneo Permanente?: ${b ? 'Sí' : 'No'}`,
  wh_rest_reason:    (s) => `⚠️ DESCANSO OBLIGATORIO | Se te ha dado un descanso de 1 min por salirte durante un partido perdiendo.\n\n⏱️ Tiempo restante: ${s}s\nEspera para volver a entrar.`,
  wh_join_title:     () => '🟢 **Nuevo Acceso**',
  wh_leave_title:    () => '🔴 **Desconexión**',
  wh_leave_time:     (m) => `⏱️ Tiempo en sala: ${m} minutos`,
  wh_leave_goals:    (g) => `⚽ Goles esta sesión: ${g}`,
  wh_leave_assists:  (a) => `💛 Asistencias: ${a}`,
  wh_leave_xp:       (x) => `✨ XP ganada: ${x}`,
  wh_support_title:  () => '🚨 ASISTENCIA REQUERIDA',
  wh_support_user:   (n) => `👤 **Usuario:** ${n}`,
  wh_support_motive: (m) => `💬 **Motivo:** ${m}`,
  wh_support_link:   (l) => `🔗 **Entrar a la sala:** ${l}`,
  wh_result_title:   () => '💐 Liga Promeriga - Reporte de Partido',
  wh_result_header:  () => '**💐 LIGA PROMERIGA - RETURNS** | **Partido Competitivo** |',
  wh_result_final:   (r, b, t) => `**Resultado Final:** ${r} - ${b} | ${t} minutos`,
  wh_result_winner:  (w) => `**Ganador:** ${w === 1 ? 'ROJO' : w === 2 ? 'AZUL' : 'EMPATE'}`,
  wh_winner_label:   (w) => `GANADOR – ${w === 1 ? 'ROJO' : 'AZUL'}`,
  wh_loser_label:    (w) => w === 1 ? 'AZUL' : 'ROJO',
  wh_mvp:            (n) => `⭐ MVP: ${n}`,
  wh_duration:       (t) => `⏱️ Duración: ${t}`,
  wh_possession:     (r, b) => `📊 Posesión: 🔴 ${r}% | 🔵 ${b}%`,
  wh_match_id:       (id) => `🆔 Partido: ${id}`,

  // ── Webhooks username ───────────────────────────────────────────────────────
  wh_name_baneos:    () => '💐 Liga Promeriga | Baneos',
  wh_name_actividad: () => '💐 Liga Promeriga | Actividad',
  wh_name_chat:      () => '💐 Liga Promeriga | Chat',
  wh_name_soporte:   () => '💐 Liga Promeriga | Soporte',
  wh_name_partidos:  () => '💐 Liga Promeriga | Partidos',
};
