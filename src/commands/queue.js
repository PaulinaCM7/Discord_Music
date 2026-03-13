// ============================================
//   📋 COMANDO: /queue
// ============================================

const { SlashCommandBuilder } = require("discord.js");
const {
  createQueueEmbed,
  createQueueButtons,
  createErrorEmbed,
} = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("📋 Muestra la lista de reproducción actual")
    .addIntegerOption((opt) =>
      opt
        .setName("pagina")
        .setDescription("Número de página a mostrar")
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "Cola vacía",
            "🎵 No hay canciones en la cola. ¡Usa `/play` para añadir música!"
          ),
        ],
      });
    }

    const page = interaction.options.getInteger("pagina") || 1;
    const { embed, page: currentPage, totalPages } = createQueueEmbed(queue, page);
    const buttons = createQueueButtons(currentPage, totalPages);

    return interaction.editReply({
      embeds: [embed],
      components: buttons,
    });
  },
};
