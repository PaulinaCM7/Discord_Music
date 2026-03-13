// ============================================
//   🔁 COMANDOS: loop, shuffle, volume, nowplaying, remove
// ============================================

const { SlashCommandBuilder } = require("discord.js");
const {
  createErrorEmbed,
  createInfoEmbed,
  createNowPlayingEmbed,
  createMusicButtons,
} = require("../utils/embeds");

function getQueue(client, guildId) {
  return client.distube.getQueue(guildId);
}

function voiceCheck(member) {
  return member.voice?.channel;
}

// ─────────────────────────────────────────
//   LOOP
// ─────────────────────────────────────────
const loopCommand = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("🔂 Cambia el modo de bucle")
    .addStringOption((opt) =>
      opt
        .setName("modo")
        .setDescription("Modo de bucle")
        .setRequired(true)
        .addChoices(
          { name: "❌ Sin bucle", value: "0" },
          { name: "🔂 Bucle de canción", value: "1" },
          { name: "🔁 Bucle de cola", value: "2" }
        )
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!voiceCheck(interaction.member))
      return interaction.editReply({
        embeds: [createErrorEmbed("No estás en un canal de voz", "🔊 Únete a uno primero.")],
      });

    const queue = getQueue(client, interaction.guildId);
    if (!queue)
      return interaction.editReply({
        embeds: [createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose.")],
      });

    const mode = parseInt(interaction.options.getString("modo"));
    await client.distube.setRepeatMode(interaction.guildId, mode);

    const modeText = ["❌ Sin bucle", "🔂 Bucle de canción", "🔁 Bucle de cola"][mode];
    return interaction.editReply({
      embeds: [createInfoEmbed("Modo de bucle", `Cambiado a: **${modeText}**`)],
    });
  },
};

// ─────────────────────────────────────────
//   SHUFFLE
// ─────────────────────────────────────────
const shuffleCommand = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("🔀 Mezcla aleatoriamente la cola de reproducción"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!voiceCheck(interaction.member))
      return interaction.editReply({
        embeds: [createErrorEmbed("No estás en un canal de voz", "🔊 Únete a uno primero.")],
      });

    const queue = getQueue(client, interaction.guildId);
    if (!queue)
      return interaction.editReply({
        embeds: [createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose.")],
      });

    await client.distube.shuffle(interaction.guildId);
    return interaction.editReply({
      embeds: [createInfoEmbed("Cola mezclada", "🔀 ¡La cola ha sido mezclada aleatoriamente!")],
    });
  },
};

// ─────────────────────────────────────────
//   VOLUME
// ─────────────────────────────────────────
const volumeCommand = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("🔊 Ajusta el volumen de reproducción")
    .addIntegerOption((opt) =>
      opt
        .setName("nivel")
        .setDescription("Nivel de volumen (1-150)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(150)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!voiceCheck(interaction.member))
      return interaction.editReply({
        embeds: [createErrorEmbed("No estás en un canal de voz", "🔊 Únete a uno primero.")],
      });

    const queue = getQueue(client, interaction.guildId);
    if (!queue)
      return interaction.editReply({
        embeds: [createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose.")],
      });

    const vol = interaction.options.getInteger("nivel");
    await client.distube.setVolume(interaction.guildId, vol);

    const volBar =
      "█".repeat(Math.round(vol / 10)) + "░".repeat(15 - Math.round(vol / 10));
    return interaction.editReply({
      embeds: [
        createInfoEmbed(
          "Volumen ajustado",
          `🔊 \`${volBar}\` **${vol}%**`
        ),
      ],
    });
  },
};

// ─────────────────────────────────────────
//   NOW PLAYING
// ─────────────────────────────────────────
const nowPlayingCommand = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("🎵 Muestra la canción que se está reproduciendo ahora"),

  async execute(interaction, client) {
    await interaction.deferReply();
    const queue = getQueue(client, interaction.guildId);

    if (!queue)
      return interaction.editReply({
        embeds: [
          createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose en este momento."),
        ],
      });

    const embed = createNowPlayingEmbed(queue.songs[0], queue);
    const buttons = createMusicButtons(queue);

    return interaction.editReply({ embeds: [embed], components: buttons });
  },
};

// ─────────────────────────────────────────
//   REMOVE
// ─────────────────────────────────────────
const removeCommand = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("🗑️ Elimina una canción de la cola")
    .addIntegerOption((opt) =>
      opt
        .setName("posicion")
        .setDescription("Número de posición en la cola (ver con /queue)")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!voiceCheck(interaction.member))
      return interaction.editReply({
        embeds: [createErrorEmbed("No estás en un canal de voz", "🔊 Únete a uno primero.")],
      });

    const queue = getQueue(client, interaction.guildId);
    if (!queue)
      return interaction.editReply({
        embeds: [createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose.")],
      });

    const pos = interaction.options.getInteger("posicion");

    if (pos >= queue.songs.length) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "Posición inválida",
            `❌ Solo hay **${queue.songs.length - 1}** canciones en la cola.`
          ),
        ],
      });
    }

    const removed = queue.songs[pos];
    queue.songs.splice(pos, 1);

    return interaction.editReply({
      embeds: [
        createInfoEmbed(
          "Canción eliminada",
          `🗑️ **${removed.name}** ha sido eliminada de la cola.`,
          0xff4757
        ),
      ],
    });
  },
};

// ─────────────────────────────────────────
//   CLEAR QUEUE
// ─────────────────────────────────────────
const clearCommand = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🗑️ Limpia todas las canciones de la cola (mantiene la actual)"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!voiceCheck(interaction.member))
      return interaction.editReply({
        embeds: [createErrorEmbed("No estás en un canal de voz", "🔊 Únete a uno primero.")],
      });

    const queue = getQueue(client, interaction.guildId);
    if (!queue)
      return interaction.editReply({
        embeds: [createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose.")],
      });

    const count = queue.songs.length - 1;
    queue.songs.splice(1);

    return interaction.editReply({
      embeds: [
        createInfoEmbed(
          "Cola limpiada",
          `🗑️ Se eliminaron **${count}** canción(es) de la cola.`,
          0xff4757
        ),
      ],
    });
  },
};

// ─────────────────────────────────────────
//   MOVE (mover canción en la cola)
// ─────────────────────────────────────────
const moveCommand = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("🔃 Mueve una canción a otra posición en la cola")
    .addIntegerOption((opt) =>
      opt
        .setName("desde")
        .setDescription("Posición actual de la canción")
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("hasta")
        .setDescription("Nueva posición para la canción")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!voiceCheck(interaction.member))
      return interaction.editReply({
        embeds: [createErrorEmbed("No estás en un canal de voz", "🔊 Únete a uno primero.")],
      });

    const queue = getQueue(client, interaction.guildId);
    if (!queue)
      return interaction.editReply({
        embeds: [createErrorEmbed("Sin música", "🎵 No hay música reproduciéndose.")],
      });

    const from = interaction.options.getInteger("desde");
    const to = interaction.options.getInteger("hasta");
    const maxPos = queue.songs.length - 1;

    if (from > maxPos || to > maxPos) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "Posición inválida",
            `❌ Solo hay **${maxPos}** canciones en la cola.`
          ),
        ],
      });
    }

    const song = queue.songs.splice(from, 1)[0];
    queue.songs.splice(to, 0, song);

    return interaction.editReply({
      embeds: [
        createInfoEmbed(
          "Canción movida",
          `🔃 **${song.name}** movida de la posición #${from} a #${to}.`
        ),
      ],
    });
  },
};

module.exports = [
  loopCommand,
  shuffleCommand,
  volumeCommand,
  nowPlayingCommand,
  removeCommand,
  clearCommand,
  moveCommand,
];
