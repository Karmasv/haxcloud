// =============================================================================
//  roles.js — Sistema de roles y auth
// =============================================================================

function getAuth(player) { return authMap.get(player.id)?.auth ?? null; }
function getConn(player) { return authMap.get(player.id)?.conn ?? null; }

// Retorna nivel numérico del rol:
// 4=Owner, 3=Admin, 2=Mod, 1=VIP, 0=jugador
function getRole(player) {
  const auth = getAuth(player);
  if (!auth) return 0;
  if (ownerList.some(o => o[0] === auth)) return 4;
  if (adminList.some(a => a[0] === auth)) return 3;
  if (modList.some(m => m[0] === auth))   return 2;
  if (vipList.some(v => v[0] === auth))   return 1;
  return 0;
}

function getRoleLabel(player) {
  const role = getRole(player);
  return role === 4 ? "👑 Owner"
       : role === 3 ? "🌟 Admin"
       : role === 2 ? "🛡️ Mod"
       : role === 1 ? "💎 VIP"
       : "Jugador";
}

function isVip(player)   { return getRole(player) >= 1; }
function isMod(player)   { return getRole(player) >= 2; }
function isAdmin(player) { return getRole(player) >= 3; }
function isOwner(player) { return getRole(player) >= 4; }

