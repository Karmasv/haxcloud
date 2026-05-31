'use strict';
// =============================================================================
//  discord-bot.js — Bot de Discord para vinculación de cuentas
//
//  Requiere instalar discord.js: npm install discord.js
// =============================================================================

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN || 'TU_TOKEN_AQUI';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'TU_CLIENT_ID';
const GUILD_ID = process.env.DISCORD_GUILD_ID || 'TU_GUILD_ID';
const MANAGER_URL = 'http://localhost:3456'; // HTTP server del manager

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Registrar slash command /vincular
const commands = [
  new SlashCommandBuilder()
    .setName('vincular')
    .setDescription('Vincula tu cuenta de HaxBall con Discord')
    .addStringOption(option =>
      option.setName('codigo')
        .setDescription('Código que apareció en la sala al escribir !register')
        .setRequired(true)
    ),
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registrando slash commands...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Slash commands registrados.');
  } catch (error) {
    console.error('Error registrando slash commands:', error);
  }
})();

client.on('ready', () => {
  console.log(`✅ Bot de Discord conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'vincular') {
    const code = interaction.options.getString('codigo').trim().toUpperCase();

    try {
      const response = await fetch(`${MANAGER_URL}/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discord_id: interaction.user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await interaction.reply({
          content: `✅ ¡Cuenta vinculada exitosamente! Bienvenido, **${data.playerName}**. Tus estadísticas y monedas ahora están ligadas a tu cuenta de Discord.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `❌ ${data.message || 'Código inválido o expirado.'}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error al contactar con el manager:', error);
      await interaction.reply({
        content: '❌ Error interno. Inténtalo de nuevo más tarde.',
        ephemeral: true,
      });
    }
  }
});

client.login(TOKEN);
