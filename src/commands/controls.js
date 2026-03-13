// ============================================
//   ⏭️ COMANDOS DE CONTROL: skip, previous, stop, pause
// ============================================

const { SlashCommandBuilder } = require("discord.js");
const { createErrorEmbed, createInfoEmbed } = require("../utils/embeds");

// ─────────────────────────────────────────
//   HELPER: Verificaciones comunes
// ─────────────────────────────────────────
function checkVoiceAndQueue(interaction, client) {
  const queue = client.distube.getQueue(interaction.guildId);

  if (!interaction.member.voice?.channel) {
    return {
      error: createErrorEmbed(
        "No estás en un canal de voz",
        "🔊 ¡Únete a un canal de voz primero!"
      ),
    };
  }

  if (!queue) {
    return {
      error: createErrorEmbed(
        "Sin música",
        "🎵 No hay música reproduciéndose en este momento."
      ),
    };
  }

  return { queue };
}

// ─────────────────────────────────────────
//   SKIP
// ─────────────────────────────────────────
const skipCommand = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("⏭️ Salta a la siguiente canción en la cola"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { error, queue } = checkVoiceAndQueue(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    if (queue.songs.length <= 1) {
      await client.distube.stop(interaction.guildId);
      return interaction.editReply({
        embeds: [createInfoEmbed("Cola vacía", "⏹️ No hay más canciones. Música detenida.")],
      });
    }

    await client.distube.skip(interaction.guildId);
    await interaction.deleteReply();
  },
};

// ─────────────────────────────────────────
//   PREVIOUS
// ─────────────────────────────────────────
const previousCommand = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("⏮️ Regresa a la canción anterior"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { error, queue } = checkVoiceAndQueue(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    try {
      await client.distube.previous(interaction.guildId);
      await interaction.deleteReply();
    } catch {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "Sin historial",
            "⏮️ No hay canción anterior en el historial."
          ),
        ],
      });
    }
  },
};

// ─────────────────────────────────────────
//   STOP
// ─────────────────────────────────────────
const stopCommand = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("⏹️ Detiene la música y vacía la cola"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { error, queue } = checkVoiceAndQueue(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    await client.distube.stop(interaction.guildId);
    return interaction.editReply({
      embeds: [
        createInfoEmbed("Detenido", "⏹️ Música detenida y cola vaciada.", 0xff4757),
      ],
    });
  },
};

// ─────────────────────────────────────────
//   PAUSE
// ─────────────────────────────────────────
const pauseCommand = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("⏸️ Pausa o reanuda la reproducción"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { error, queue } = checkVoiceAndQueue(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    if (queue.paused) {
      await client.distube.resume(interaction.guildId);
      return interaction.editReply({
        embeds: [createInfoEmbed("Reanudado", "▶️ Música reanudada.", 0x1db954)],
      });
    } else {
      await client.distube.pause(interaction.guildId);
      return interaction.editReply({
        embeds: [createInfoEmbed("Pausado", "⏸️ Música pausada.", 0xffa502)],
      });
    }
  },
};

module.exports = [skipCommand, previousCommand, stopCommand, pauseCommand];
