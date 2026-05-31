'use strict';
// =============================================================================
//  i18n/en.js — English (USA)
// =============================================================================
module.exports = {
  // ── Welcome ─────────────────────────────────────────────────────────────────
  welcome_bar1:    (name) => `━━━━━━━━  💐 LIGA PROMERIGA - RETURNS  ━━━━━━━━`,
  welcome_bar2:    ()     => `         Official Public Room of the League`,
  welcome_bar3:    ()     => `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  welcome_msg:     (name) => `👋 Welcome, ${name}! Type '!help' to see the commands.`,
  welcome_discord: (link) => `💐 Discord: ${link}`,

  // ── Roles ───────────────────────────────────────────────────────────────────
  role_owner:   '👑 Owner',
  role_admin:   '🌟 Admin',
  role_mod:     '🛡️ Mod',
  role_vip:     '💎 VIP',
  role_player:  'Player',
  role_invited: 'Guest',

  // ── Connections ─────────────────────────────────────────────────────────────
  joined_owner:   (name) => `👑 ${name} (Owner) connected.`,
  joined_admin:   (name) => `🌟 ${name} (Admin) connected.`,
  joined_mod:     (name) => `🛡️ ${name} (Mod) connected.`,
  joined_vip:     (name) => `💎 ${name} (VIP) connected.`,
  blacklist_ban:  (name) => `🔨 ${name} is on the blacklist and was banned.`,
  blacklist_msg:  (link) => `Permanently banned. Appeal at: ${link}`,

  // ── Room full ───────────────────────────────────────────────────────────────
  vip_lock:       (cur, max) => `💎 Room almost full (${cur}/${max}). Only VIPs can join.`,
  vip_unlock:     ()         => `✅ Room is open to the public again.`,

  // ── Game ────────────────────────────────────────────────────────────────────
  win_prob_title: () => `⚔️ Win probabilities:`,
  win_prob_line:  (r, b) => `🔴 RED: ${r}%  |  🔵 BLUE: ${b}%`,
  result_bar1:    () => `━━━━━━━━━  💐 LIGA PROMERIGA  ━━━━━━━━━`,
  result_score:   (r, b) => `⚽ Result: 🔴 ${r} - ${b} 🔵`,
  result_poss:    (r, b) => `📊 Possession: 🔴 ${r}% | 🔵 ${b}%`,
  result_zone:    (r, b) => `📍 Action zone: 🔴 ${r}% | 🔵 ${b}%`,
  result_streak:  (n)    => `🔥 Streak: ${n} games in a row`,
  result_draw:    ()     => `⏱️ Time's up — draw`,
  golden_goal:    ()     => `⚡ GOLDEN GOAL! Next goal decides the match.`,
  ragequit:       ()     => `🤡 Ragequit detected, match ended.`,
  restart_msg:    ()     => `🔃 Match restarted.`,
  swap_msg:       ()     => `🔄 Teams swapped.`,

  // ── Goals ───────────────────────────────────────────────────────────────────
  goal_team:      (team, speed) => `⚽ Goal for ${team === 1 ? '🔴 Red' : '🔵 Blue'} • ${speed}`,
  goal_solo:      (name, phrase, speed) => `⚽ ${name}, ${phrase} • ${speed}`,
  goal_assist:    (name, phrase, assist, speed) => `⚽ ${name}, ${phrase} ${assist} • ${speed}`,
  own_goal:       (phrase, speed) => `🐸 ${phrase} • ${speed}`,
  cs_one:         (name) => `🧤 Clean Sheet: ${name} kept a clean sheet`,
  cs_two:         (a, b) => `🧱 Clean Sheet: ${a} and ${b} kept their goals clean`,

  // ── Goal phrases ────────────────────────────────────────────────────────────
  phrases_assist: ['great wall pass with','built up with','precise touch by','assisted by','combination with'],
  phrases_solo:   ['clinical finish','precise shot','well worked goal','sent it home','no hesitation'],
  phrases_og:     ['{} made a big mistake','{} gifted the ball','Costly error by {}','{} was caught out','{} fell asleep'],

  // ── Inactivity ──────────────────────────────────────────────────────────────
  inactivity_warn: (name) => `⚠️ ${name}, if you don't move in the next few seconds you'll be kicked for inactivity.`,
  inactivity_kick: () => 'Kicked for inactivity',

  // ── AFK ────────────────────────────────────────────────────────────────────
  afk_already_spec: () => "You're already a spectator!",
  afk_already_afk:  () => "You're already AFK!",
  afk_gone:         (name) => `😴 ${name} went AFK.`,
  afk_back:         (name) => `✅ ${name} is back.`,
  afk_cooldown:     (m, s) => `⏱️ Cooldown: ${m}m ${s}s`,
  afk_cant_losing:  () => "You can't go AFK while your team is losing!",
  afk_list_empty:   () => '😴 Nobody is AFK.',
  afk_list:         (names) => `😴 AFK: ${names}`,
  sub_wait:         () => 'You must wait before using !sub again.',

  // ── Commands ────────────────────────────────────────────────────────────────
  cmd_help_intro:   () => '📖 Available commands:',
  cmd_help_vip:     () => '💎 VIP:',
  cmd_help_mod:     () => '🛡️ Mod:',
  cmd_help_admin:   () => '🌟 Admin:',
  cmd_help_owner:   () => '👑 Owner:',
  cmd_help_tip:     () => "\n💡 Use '!help <command>' for more details.",
  cmd_invalid_player: () => '❌ Invalid player',
  cmd_no_self_msg:  () => "❌ You can't send messages to yourself.",
  cmd_not_found:    () => '❌ Player not found!',
  cmd_no_perm:      () => "You don't have permission to ban!",
  discord_title:    () => '💐 LIGA PROMERIGA - RETURNS',
  discord_subtitle: () => 'Official Discord server:',
  leave_msg:        () => '👋 Goodbye!',
  avatar_on:        () => '🔃 Movement indicators enabled.',
  avatar_off:       () => '🔃 Movement indicators disabled.',
  jump_vip_only:    () => '💎 VIP exclusive command.',
  jump_spec_only:   () => 'You must be a spectator to jump the queue!',
  jump_game_only:   () => 'You can only jump during an active match!',
  jump_cooldown:    (m, s) => `⏱️ Cooldown: ${m}m ${s}s`,
  jump_done:        (name) => `💎 ${name} jumped to the front of the queue!`,
  anon_cooldown:    (m, s) => `⏱️ Cooldown: ${m}m ${s}s`,
  anon_empty:       () => '❌ Write a message after !anon.',
  anon_msg:         (text) => `👻 Anonymous: ${text}`,
  rename_empty:     () => '❌ Write the new name after the command.',
  rename_done:      (name) => `✅ Stats name changed to: ${name}`,

  // ── Stats ───────────────────────────────────────────────────────────────────
  stats_line1:   (name, g, w, l, wr) => `📋 ${name} — Games: ${g} | 🏆 ${w}W 😵 ${l}L | 📊 ${wr}`,
  stats_line2:   (g, a, cs, og, sc, pt) => `⚽ ${g}G ⭐ ${a}A 🧤 ${cs}CS 🐸 ${og}OG | 💎 Score: ${sc} | ⏱️ ${pt}`,
  stats_share:   (name) => `🏆 ${name} shared their stats:`,
  stats_reset:   () => '✅ Your stats have been reset.',
  top_empty:     () => 'Not enough games recorded yet!',
  top_header:    () => `━━━━━━━  💎 TOP 5  💎  ━━━━━━━`,
  top_footer:    () => `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,

  // ── XP ──────────────────────────────────────────────────────────────────────
  xp_line1:      (name, rango, nivel) => `✨ ${name} — ${rango} (Level ${nivel})`,
  xp_line2:      (xp, prog) => `Total XP: ${xp} | ${prog}`,
  xp_progress:   (cur, max, next) => `${cur}/${max} XP to ${next}`,
  xp_max:        () => 'Maximum rank!',
  xp_rankup:     (name, rango, xp) => `🎉 ${name} ranked up to ${rango}! (${xp} XP)`,

  // ── Votekick ────────────────────────────────────────────────────────────────
  vote_active:   () => 'A vote is already active!',
  vote_usage:    () => '❌ Usage: !votekick #ID',
  vote_invalid:  () => 'Invalid player!',
  vote_no_mod:   () => "You can't vote to kick a Mod or higher!",
  vote_start:    (by, target, cur, req) => `🗳️ ${by} started a vote to kick ${target}.\nType '!vote' to vote. (${cur}/${req})`,
  vote_expired:  (target) => `🗳️ Vote to kick ${target} expired.`,
  vote_no_active:() => 'No vote is currently active!',
  vote_already:  () => "You've already voted!",
  vote_progress: (name, cur, req) => `🗳️ ${name} voted. (${cur}/${req})`,
  vote_kicked:   (name) => `✅ ${name} was kicked by vote.`,

  // ── Call admin ──────────────────────────────────────────────────────────────
  calladmin_msg: (name) => `🆘 ${name} needs an admin.`,

  // ── Mod/Admin ───────────────────────────────────────────────────────────────
  mute_usage:    () => '❌ Usage: !mute #ID [minutes]',
  mute_already:  () => 'Player is already muted!',
  mute_rank:     () => "You can't mute someone of your rank or higher!",
  mute_done:     (name, min) => `🔇 ${name} was muted for ${min} minutes.`,
  unmute_done:   (name) => `🔊 ${name} was unmuted.`,
  unmute_notfound:() => 'Player not found in mute list!',
  mute_empty:    () => '🔇 Nobody is muted.',
  mute_list:     (list) => `🔇 Muted: ${list}`,
  setvip_done:   (name) => `💎 ${name} is now a VIP!`,
  setvip_already:() => 'Player is already VIP!',
  removevip_done:(name) => `💎 ${name} is no longer VIP.`,
  removevip_nf:  () => 'VIP not found!',
  vip_empty:     () => '💎 No VIP players.',
  vip_list:      (list) => `💎 VIPs: ${list}`,
  setmod_done:   (name) => `🛡️ ${name} is now a Moderator.`,
  setmod_already:() => 'Player is already a Mod!',
  removemod_done:(name) => `🛡️ ${name} is no longer a Moderator.`,
  setadmin_done: (name) => `🌟 ${name} is now an Admin.`,
  setadmin_already:() => 'Player is already an Admin!',
  removeadmin_done:(name) => `🌟 ${name} is no longer an Admin.`,
  admin_none:    () => 'No staff registered.',
  clearbans_all: () => '✅ All bans cleared.',
  clearbans_one: (name) => `✅ ${name} was unbanned.`,
  clearbans_inv: () => 'Invalid number!',
  bans_empty:    () => '🔨 Nobody is banned.',
  bans_list:     (list) => `🔨 Banned: ${list}`,
  password_set:  (pwd) => `🔑 Password: ${pwd}`,
  password_rm:   () => '🔑 Password removed.',
  slowmode_msg:  (n) => `🐢 Slow mode: ${n} seconds`,
  slowmode_off:  () => '🐢 Slow mode: disabled',
  owner_claimed: (name) => `👑 ${name} is now the room Owner.`,
  owner_relogin: () => '✅ Room admin reactivated.',
  owner_wrong:   () => '❌ Wrong password.',

  // ── Choose mode ─────────────────────────────────────────────────────────────
  choose_pick:   () => "📖 Pick a player by number, 'top', 'random' or 'bottom'",
  choose_10s:    () => '⏱️ 10 seconds left to pick!',
  choose_timeout:() => "You didn't pick in time.",
  choose_list:   (list) => `📃 Queue: ${list}`,
  choose_done:   (cap, pick) => `✅ ${cap} picked ${pick}`,
  choose_invalid:() => 'Invalid number!',

  // ── Ghost kick ──────────────────────────────────────────────────────────────
  ghost_kick:    () => '👻 Ghost kick',

  // ── Break ───────────────────────────────────────────────────────────────────
  ragequit_kick: () => '⚠️ MANDATORY BREAK | You have been given a 1 min break for leaving during a losing match.',

  // ── Webhook labels ──────────────────────────────────────────────────────────
  wh_ban_title:      () => '👢 Expulsion Record 👢',
  wh_ban_player:     (name, auth) => `Expelled Player: ${name} [a.i] (Auth: ${auth} )`,
  wh_ban_by:         (name, auth) => `Performed by: ${name} (Auth: ${auth})`,
  wh_ban_reason:     (r) => `Reason: ${r ?? 'No reason'}`,
  wh_ban_permanent:  (b) => `Permanent Ban?: ${b ? 'Yes' : 'No'}`,
  wh_rest_reason:    (s) => `⚠️ MANDATORY BREAK | 1 min break for leaving during a losing match.\n\n⏱️ Time remaining: ${s}s\nWait before rejoining.`,
  wh_join_title:     () => '🟢 **New Connection**',
  wh_leave_title:    () => '🔴 **Disconnection**',
  wh_leave_time:     (m) => `⏱️ Time in room: ${m} minutes`,
  wh_leave_goals:    (g) => `⚽ Goals this session: ${g}`,
  wh_leave_assists:  (a) => `💛 Assists: ${a}`,
  wh_leave_xp:       (x) => `✨ XP earned: ${x}`,
  wh_support_title:  () => '🚨 ASSISTANCE REQUIRED',
  wh_support_user:   (n) => `👤 **User:** ${n}`,
  wh_support_motive: (m) => `💬 **Reason:** ${m}`,
  wh_support_link:   (l) => `🔗 **Join room:** ${l}`,
  wh_result_title:   () => '💐 Liga Promeriga - Match Report',
  wh_result_header:  () => '**💐 LIGA PROMERIGA - RETURNS** | **Competitive Match** |',
  wh_result_final:   (r, b, t) => `**Final Result:** ${r} - ${b} | ${t} minutes`,
  wh_result_winner:  (w) => `**Winner:** ${w === 1 ? 'RED' : w === 2 ? 'BLUE' : 'DRAW'}`,
  wh_winner_label:   (w) => `WINNER – ${w === 1 ? 'RED' : 'BLUE'}`,
  wh_loser_label:    (w) => w === 1 ? 'BLUE' : 'RED',
  wh_mvp:            (n) => `⭐ MVP: ${n}`,
  wh_duration:       (t) => `⏱️ Duration: ${t}`,
  wh_possession:     (r, b) => `📊 Possession: 🔴 ${r}% | 🔵 ${b}%`,
  wh_match_id:       (id) => `🆔 Match ID: ${id}`,

  wh_name_baneos:    () => '💐 Liga Promeriga | Bans',
  wh_name_actividad: () => '💐 Liga Promeriga | Activity',
  wh_name_chat:      () => '💐 Liga Promeriga | Chat',
  wh_name_soporte:   () => '💐 Liga Promeriga | Support',
  wh_name_partidos:  () => '💐 Liga Promeriga | Matches',
};
