// ============================================
//   ⚡ EVENTOS DEL CLIENTE DISCORD
// ============================================

const {
  createNowPlayingEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createMusicButtons,
  createQueueEmbed,
  createQueueButtons,
} = require("../utils/embeds");

function setupClientEvents(client) {
  // ─────────────────────────────────────────
  //   SLASH COMMANDS
  // ─────────────────────────────────────────
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error en comando /${interaction.commandName}:`, error);

        const embed = createErrorEmbed(
          "Error al ejecutar el comando",
          `\`\`\`${error.message?.slice(0, 200)}\`\`\``
        );

        const replyMethod = interaction.replied || interaction.deferred
          ? "followUp"
          : "reply";

        try {
          await interaction[replyMethod]({
            embeds: [embed],
            ephemeral: true,
          });
        } catch {}
      }
    }

    // ─────────────────────────────────────────
    //   BOTONES
    // ─────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId, guildId, member } = interaction;
      const queue = client.distube.getQueue(guildId);

      // Botones de cola (paginación)
      if (customId.startsWith("queue_page_")) {
        const page = parseInt(customId.split("_")[2]);
        if (!queue) {
          return interaction.update({
            embeds: [createErrorEmbed("Sin cola", "No hay música reproduciéndose.")],
            components: [],
          });
        }

        const { embed, page: currentPage, totalPages } = createQueueEmbed(queue, page);
        const buttons = createQueueButtons(currentPage, totalPages);

        return interaction.update({ embeds: [embed], components: buttons });
      }

      if (customId === "queue_refresh") {
        if (!queue) {
          return interaction.update({
            embeds: [createErrorEmbed("Sin cola", "No hay música reproduciéndose.")],
            components: [],
          });
        }

        const { embed, page, totalPages } = createQueueEmbed(queue, 1);
        const buttons = createQueueButtons(page, totalPages);

        return interaction.update({ embeds: [embed], components: buttons });
      }

      // Verificar que el usuario esté en el canal de voz
      if (!member.voice?.channel) {
        return interaction.reply({
          embeds: [
            createErrorEmbed(
              "No estás en un canal de voz",
              "🔊 ¡Únete a un canal de voz para controlar la música!"
            ),
          ],
          ephemeral: true,
        });
      }

      if (!queue) {
        return interaction.reply({
          embeds: [
            createErrorEmbed(
              "Sin música",
              "🎵 No hay música reproduciéndose en este momento."
            ),
          ],
          ephemeral: true,
        });
      }

      await interaction.deferUpdate();

      try {
        switch (customId) {
          // ─── PAUSAR / REANUDAR ───
          case "btn_pause":
            if (queue.paused) {
              await client.distube.resume(guildId);
            } else {
              await client.distube.pause(guildId);
            }
            break;

          // ─── SALTAR ───
          case "btn_skip":
            if (queue.songs.length <= 1) {
              await client.distube.stop(guildId);
              return;
            }
            await client.distube.skip(guildId);
            return; // El evento playSong actualizará el mensaje

          // ─── ANTERIOR ───
          case "btn_previous":
            await client.distube.previous(guildId);
            return;

          // ─── DETENER ───
          case "btn_stop":
            await client.distube.stop(guildId);
            await interaction.editReply({
              embeds: [
                createInfoEmbed(
                  "Detenido",
                  "⏹️ Música detenida y cola vaciada.",
                  0xff4757
                ),
              ],
              components: [],
            });
            return;

          // ─── LOOP (canción) ───
          case "btn_loop":
            const newLoopMode = queue.repeatMode === 1 ? 0 : 1;
            await client.distube.setRepeatMode(guildId, newLoopMode);
            break;

          // ─── LOOP (cola) ───
          case "btn_loop_queue":
            const newQueueLoop = queue.repeatMode === 2 ? 0 : 2;
            await client.distube.setRepeatMode(guildId, newQueueLoop);
            break;

          // ─── ALEATORIO ───
          case "btn_shuffle":
            await client.distube.shuffle(guildId);
            break;

          // ─── VER COLA ───
          case "btn_queue":
            const updatedQueue = client.distube.getQueue(guildId);
            if (!updatedQueue || updatedQueue.songs.length === 0) {
              await interaction.followUp({
                embeds: [createErrorEmbed("Cola vacía", "No hay canciones en la cola.")],
                ephemeral: true,
              });
              return;
            }

            const { embed: queueEmbed, page, totalPages } = createQueueEmbed(updatedQueue, 1);
            const queueButtons = createQueueButtons(page, totalPages);

            await interaction.followUp({
              embeds: [queueEmbed],
              components: queueButtons,
              ephemeral: false,
            });
            return;
        }

        // Actualizar el embed del player con el nuevo estado
        const updatedQueue2 = client.distube.getQueue(guildId);
        if (updatedQueue2) {
          const newEmbed = createNowPlayingEmbed(updatedQueue2.songs[0], updatedQueue2);
          const newButtons = createMusicButtons(updatedQueue2);

          await interaction.editReply({
            embeds: [newEmbed],
            components: newButtons,
          });
        }
      } catch (err) {
        console.error("Error en botón:", err);
        try {
          await interaction.followUp({
            embeds: [
              createErrorEmbed("Error", err.message?.slice(0, 200) || "Error desconocido"),
            ],
            ephemeral: true,
          });
        } catch {}
      }
    }
  });
}

module.exports = { setupClientEvents };
