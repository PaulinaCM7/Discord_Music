// ============================================
//   🎵 EVENTOS DE DISTUBE
// ============================================

const { EmbedBuilder } = require("discord.js");
const {
  createNowPlayingEmbed,
  createAddedEmbed,
  createPlaylistEmbed,
  createErrorEmbed,
  createMusicButtons,
} = require("../utils/embeds");

// Guardar referencia al mensaje del player para editar
const playerMessages = new Map();

function setupDistubeEvents(client) {
  const distube = client.distube;

  // ─────────────────────────────────────────
  //   NUEVA CANCIÓN
  // ─────────────────────────────────────────
  distube.on("playSong", async (queue, song) => {
    const embed = createNowPlayingEmbed(song, queue);
    const buttons = createMusicButtons(queue);

    try {
      // Eliminar mensaje anterior del player
      const oldMsg = playerMessages.get(queue.textChannel?.id);
      if (oldMsg) {
        try {
          await oldMsg.delete();
        } catch {}
      }

      const msg = await queue.textChannel?.send({
        embeds: [embed],
        components: buttons,
      });

      if (msg) playerMessages.set(queue.textChannel?.id, msg);
    } catch (err) {
      console.error("Error al enviar embed de canción:", err);
    }
  });

  // ─────────────────────────────────────────
  //   CANCIÓN AÑADIDA
  // ─────────────────────────────────────────
  distube.on("addSong", async (queue, song) => {
    const position = queue.songs.indexOf(song);
    if (position === 0) return; // Ya está reproduciendo

    const embed = createAddedEmbed(song, position);

    try {
      const msg = await queue.textChannel?.send({ embeds: [embed] });
      // Auto-borrar tras 10 segundos
      if (msg) setTimeout(() => msg.delete().catch(() => {}), 10000);
    } catch {}
  });

  // ─────────────────────────────────────────
  //   PLAYLIST AÑADIDA
  // ─────────────────────────────────────────
  distube.on("addList", async (queue, playlist) => {
    const embed = createPlaylistEmbed(playlist, playlist.songs?.[0]);

    try {
      const msg = await queue.textChannel?.send({ embeds: [embed] });
      if (msg) setTimeout(() => msg.delete().catch(() => {}), 15000);
    } catch {}
  });

  // ─────────────────────────────────────────
  //   COLA VACÍA
  // ─────────────────────────────────────────
  distube.on("finish", async (queue) => {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(
        "✅ **Cola finalizada.** No hay más canciones que reproducir.\n\nUsa `/play` para añadir más música 🎵"
      )
      .setTimestamp();

    try {
      // Eliminar mensaje del player
      const oldMsg = playerMessages.get(queue.textChannel?.id);
      if (oldMsg) {
        try {
          await oldMsg.delete();
        } catch {}
        playerMessages.delete(queue.textChannel?.id);
      }

      const msg = await queue.textChannel?.send({ embeds: [embed] });
      if (msg) setTimeout(() => msg.delete().catch(() => {}), 15000);
    } catch {}
  });

  // ─────────────────────────────────────────
  //   ERROR
  // ─────────────────────────────────────────
  distube.on("error", async (channel, error) => {
    console.error("DisTube Error:", error);

    const embed = createErrorEmbed(
      "Error de reproducción",
      `\`\`\`${error.message?.slice(0, 200) || "Error desconocido"}\`\`\`\n\nIntenta con otro enlace o usa \`/play\` de nuevo.`
    );

    try {
      const msg = await channel?.send({ embeds: [embed] });
      if (msg) setTimeout(() => msg.delete().catch(() => {}), 15000);
    } catch {}
  });

  // ─────────────────────────────────────────
  //   CANCIÓN SALTADA
  // ─────────────────────────────────────────
  distube.on("initQueue", (queue) => {
    queue.volume = 80; // Volumen por defecto
  });

  // ─────────────────────────────────────────
  //   DESCONECTADO
  // ─────────────────────────────────────────
  distube.on("disconnect", async (queue) => {
    const oldMsg = playerMessages.get(queue.textChannel?.id);
    if (oldMsg) {
      try {
        await oldMsg.delete();
      } catch {}
      playerMessages.delete(queue.textChannel?.id);
    }
  });
}

module.exports = { setupDistubeEvents, playerMessages };
