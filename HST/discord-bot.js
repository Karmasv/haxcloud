'use strict';
// =============================================================================
//  discord-bot.js — Bot de Discord (registro, VIP, transferencia de auth)
// =============================================================================

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const storage = require('./storage');

const TOKEN = process.env.DISCORD_TOKEN || 'TU_TOKEN_AQUI';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'TU_CLIENT_ID';
const GUILD_ID = process.env.DISCORD_GUILD_ID || 'TU_GUILD_ID';
const VIP_ROLE_ID = process.env.VIP_ROLE_ID || 'TU_VIP_ROLE_ID';
const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID || 'TU_ADMIN_CHANNEL_ID';
const MANAGER_URL = 'http://localhost:3456';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// ─── Registrar slash commands ─────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('vincular')
    .setDescription('Vincula tu cuenta de HaxBall con Discord')
    .addStringOption(option =>
      option.setName('codigo')
        .setDescription('Código que apareció en la sala al escribir !register')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('vip_claim')
    .setDescription('Solicita el rango VIP en las salas (requiere rol VIP y cuenta vinculada)'),
  new SlashCommandBuilder()
    .setName('transfer_auth')
    .setDescription('Transfiere tu progreso a un nuevo auth de HaxBall')
    .addStringOption(option =>
      option.setName('nuevo_auth')
        .setDescription('Tu nuevo auth de HaxBall (consíguelo en la sala con !myauth)')
        .setRequired(true)
    ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registrando slash commands...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Slash commands registrados.');
  } catch (error) {
    console.error('Error registrando slash commands:', error);
  }
})();

client.on('ready', () => {
  console.log(`✅ Bot de Discord conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  // ─── Slash commands ──────────────────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'vincular') {
      const code = interaction.options.getString('codigo').trim().toUpperCase();
      try {
        const response = await fetch(`${MANAGER_URL}/vincular`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, discord_id: interaction.user.id }),
        });
        const data = await response.json();
        if (data.success) {
          await interaction.reply({ content: `✅ ¡Cuenta vinculada! Bienvenido, **${data.playerName}**.`, ephemeral: true });
        } else {
          await interaction.reply({ content: `❌ ${data.message || 'Código inválido o expirado.'}`, ephemeral: true });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Error interno.', ephemeral: true });
      }
      return;
    }

    if (interaction.commandName === 'vip_claim') {
      // Verificar rol VIP
      if (!interaction.member.roles.cache.has(VIP_ROLE_ID)) {
        await interaction.reply({ content: '❌ No tienes el rol VIP requerido.', ephemeral: true });
        return;
      }
      // Verificar vinculación
      const player = storage.getPlayerByDiscord(interaction.user.id);
      if (!player) {
        await interaction.reply({ content: '❌ No tienes tu cuenta vinculada. Usa `!register` en la sala y luego `/vincular`.', ephemeral: true });
        return;
      }
      // Verificar si ya reclamó VIP
      if (storage.checkVipClaim(interaction.user.id)) {
        await interaction.reply({ content: '❌ Ya reclamaste tu VIP anteriormente. Si cambiaste de auth usa `/transfer_auth`.', ephemeral: true });
        return;
      }
      // Enviar solicitud al canal de admins
      const adminChannel = client.channels.cache.get(ADMIN_CHANNEL_ID);
      if (!adminChannel) {
        await interaction.reply({ content: '❌ Canal de administradores no configurado.', ephemeral: true });
        return;
      }
      const embed = {
        title: '🔐 Solicitud de VIP',
        description: `**Usuario:** ${interaction.user.tag}\n**Auth:** \`${player.auth}\`\n**Nombre en sala:** ${player.name}\n\n¿Autorizas el rango VIP?`,
        color: 0xffd700,
        footer: { text: 'HaxCloud VIP' },
        timestamp: new Date().toISOString(),
      };
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`vip_approve_${interaction.user.id}`).setLabel('Aprobar').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`vip_reject_${interaction.user.id}`).setLabel('Rechazar').setStyle(ButtonStyle.Danger),
        );
      await adminChannel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Tu solicitud ha sido enviada a los administradores.', ephemeral: true });
      return;
    }

    if (interaction.commandName === 'transfer_auth') {
      const nuevoAuth = interaction.options.getString('nuevo_auth').trim();
      if (!/^[a-zA-Z0-9_-]{43}$/.test(nuevoAuth)) {
        await interaction.reply({ content: '❌ El formato del auth no es válido (debe tener 43 caracteres).', ephemeral: true });
        return;
      }
      const success = storage.transferAuth(interaction.user.id, nuevoAuth);
      if (!success) {
        await interaction.reply({ content: '❌ No tienes una cuenta vinculada.', ephemeral: true });
        return;
      }
      await interaction.reply({ content: '✅ Tu auth ha sido transferido. Tu progreso y VIP se conservan.', ephemeral: true });
      return;
    }
  }

  // ─── Botones de aprobación VIP ───────────────────────────────────────────
  if (interaction.isButton()) {
    const customId = interaction.customId;
    if (customId.startsWith('vip_approve_')) {
      const targetDiscordId = customId.replace('vip_approve_', '');
      const result = storage.claimVip(targetDiscordId);
      if (!result.success && result.reason === 'already_claimed') {
        await interaction.reply({ content: '⚠️ Este usuario ya tenía el VIP reclamado.', ephemeral: true });
        return;
      }
      if (!result.success) {
        await interaction.reply({ content: '❌ No se pudo reclamar el VIP.', ephemeral: true });
        return;
      }
      // Notificar al manager para que otorgue VIP en la sala
      try {
        await fetch(`${MANAGER_URL}/setvip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth: result.auth }),
        });
        await interaction.reply({ content: `✅ VIP otorgado a <@${targetDiscordId}> en todas las salas.`, ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Error al contactar las salas.', ephemeral: true });
      }
      return;
    }
    if (customId.startsWith('vip_reject_')) {
      const targetDiscordId = customId.replace('vip_reject_', '');
      await interaction.reply({ content: `❌ VIP rechazado para <@${targetDiscordId}>.`, ephemeral: true });
      return;
    }
  }
});

client.login(TOKEN);
