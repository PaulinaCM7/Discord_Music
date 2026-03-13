// ============================================
//   🎵 COMANDO: /play
// ============================================

const { SlashCommandBuilder } = require("discord.js");
const { createErrorEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("🎵 Reproduce una canción o playlist de YouTube / Spotify")
    .addStringOption((opt) =>
      opt
        .setName("busqueda")
        .setDescription(
          "URL de YouTube/Spotify o nombre de la canción a buscar"
        )
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { member, guild, channel } = interaction;
    const query = interaction.options.getString("busqueda");

    // Verificar que el usuario esté en un canal de voz
    if (!member.voice?.channel) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "No estás en un canal de voz",
            "🔊 ¡Únete a un canal de voz antes de reproducir música!"
          ),
        ],
      });
    }

    // Verificar permisos del bot
    const botPermissions = member.voice.channel.permissionsFor(guild.members.me);
    if (
      !botPermissions.has("Connect") ||
      !botPermissions.has("Speak")
    ) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "Sin permisos",
            "❌ No tengo permisos para conectarme o hablar en tu canal de voz."
          ),
        ],
      });
    }

    try {
      await client.distube.play(member.voice.channel, query, {
        member,
        textChannel: channel,
        skip: false,
      });

      // El evento playSong/addSong manejará la respuesta
      // Solo confirmamos que se procesó
      try {
        await interaction.deleteReply();
      } catch {}
    } catch (error) {
      console.error("Error en /play:", error);

      let errorMsg = "No se pudo reproducir la canción.";

      if (error.message?.includes("No result")) {
        errorMsg = `No se encontraron resultados para: **${query}**`;
      } else if (error.message?.includes("Private")) {
        errorMsg = "Esta playlist o canción es privada y no se puede reproducir.";
      } else if (error.message?.includes("age")) {
        errorMsg = "Esta canción tiene restricción de edad y no puede reproducirse.";
      } else if (error.message) {
        errorMsg = error.message.slice(0, 200);
      }

      return interaction.editReply({
        embeds: [createErrorEmbed("Error al reproducir", errorMsg)],
      });
    }
  },
};
