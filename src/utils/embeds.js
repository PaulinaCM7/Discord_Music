// ============================================
//   🎨 CREADOR DE EMBEDS DE MÚSICA
// ============================================

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

// ─────────────────────────────────────────
//   COLORES TEMÁTICOS
// ─────────────────────────────────────────
const COLORS = {
  music: 0x1db954,       // Verde Spotify
  youtube: 0xff0000,     // Rojo YouTube
  queue: 0x5865f2,       // Azul Discord
  error: 0xff4757,       // Rojo error
  warning: 0xffa502,     // Naranja advertencia
  info: 0x1db954,        // Info verde
};

// ─────────────────────────────────────────
//   DETECTAR FUENTE DE MÚSICA
// ─────────────────────────────────────────
function getMusicSource(url) {
  if (!url) return { emoji: "🎵", color: COLORS.music, name: "Música" };
  if (url.includes("spotify")) return { emoji: "🟢", color: COLORS.music, name: "Spotify" };
  if (url.includes("youtube") || url.includes("youtu.be"))
    return { emoji: "🔴", color: COLORS.youtube, name: "YouTube" };
  return { emoji: "🎵", color: COLORS.music, name: "Música" };
}

// ─────────────────────────────────────────
//   FORMATEAR DURACIÓN
// ─────────────────────────────────────────
function formatDuration(ms) {
  if (!ms || ms === 0) return "🔴 En vivo";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// ─────────────────────────────────────────
//   BARRA DE PROGRESO
// ─────────────────────────────────────────
function createProgressBar(current, total, size = 15) {
  if (!total || total === 0) return "🔴▬▬▬▬▬▬▬▬▬▬▬▬▬▬ En vivo";
  const progress = Math.min(current / total, 1);
  const filled = Math.round(size * progress);
  const empty = size - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `\`${bar}\``;
}

// ─────────────────────────────────────────
//   EMBED: REPRODUCIENDO AHORA
// ─────────────────────────────────────────
function createNowPlayingEmbed(song, queue) {
  const source = getMusicSource(song.url);
  const isLooping = queue?.repeatMode === 1;
  const isLoopingQueue = queue?.repeatMode === 2;
  const isShuffled = queue?.shuffle;

  const embed = new EmbedBuilder()
    .setColor(source.color)
    .setAuthor({
      name: `${source.emoji} Reproduciendo ahora`,
      iconURL: "https://i.imgur.com/1B6XQMK.png",
    })
    .setTitle(song.name.length > 60 ? song.name.slice(0, 57) + "..." : song.name)
    .setURL(song.url)
    .setThumbnail(song.thumbnail)
    .addFields(
      {
        name: "⏱️ Duración",
        value: formatDuration(song.duration * 1000),
        inline: true,
      },
      {
        name: "🎤 Artista",
        value: song.uploader?.name || song.member?.user?.username || "Desconocido",
        inline: true,
      },
      {
        name: "📻 Fuente",
        value: `${source.emoji} ${source.name}`,
        inline: true,
      }
    )
    .addFields({
      name: "📋 Cola de reproducción",
      value: queue?.songs?.length > 1
        ? `**${queue.songs.length - 1}** canción(es) en espera`
        : "Vacía",
      inline: true,
    },
    {
      name: "🔊 Volumen",
      value: `${queue?.volume || 100}%`,
      inline: true,
    },
    {
      name: "⚙️ Estado",
      value: [
        isLooping ? "🔂 Bucle (canción)" : isLoopingQueue ? "🔁 Bucle (cola)" : "▶️ Normal",
        isShuffled ? "🔀 Aleatorio" : "",
      ]
        .filter(Boolean)
        .join(" · ") || "▶️ Normal",
      inline: true,
    })
    .setFooter({
      text: `Solicitado por ${song.member?.user?.username || "Usuario"}`,
      iconURL: song.member?.user?.displayAvatarURL() || null,
    })
    .setTimestamp();

  return embed;
}

// ─────────────────────────────────────────
//   EMBED: CANCIÓN AÑADIDA
// ─────────────────────────────────────────
function createAddedEmbed(song, position) {
  const source = getMusicSource(song.url);

  return new EmbedBuilder()
    .setColor(source.color)
    .setAuthor({ name: `➕ Añadido a la cola` })
    .setTitle(song.name.length > 60 ? song.name.slice(0, 57) + "..." : song.name)
    .setURL(song.url)
    .setThumbnail(song.thumbnail)
    .addFields(
      { name: "⏱️ Duración", value: formatDuration(song.duration * 1000), inline: true },
      { name: "📻 Fuente", value: `${source.emoji} ${source.name}`, inline: true },
      { name: "📍 Posición", value: `#${position}`, inline: true }
    )
    .setFooter({ text: `Solicitado por ${song.member?.user?.username || "Usuario"}` })
    .setTimestamp();
}

// ─────────────────────────────────────────
//   EMBED: PLAYLIST AÑADIDA
// ─────────────────────────────────────────
function createPlaylistEmbed(playlist, firstSong) {
  const source = getMusicSource(firstSong?.url || "");

  return new EmbedBuilder()
    .setColor(source.color)
    .setAuthor({ name: `📀 Playlist añadida a la cola` })
    .setTitle(playlist.name.length > 60 ? playlist.name.slice(0, 57) + "..." : playlist.name)
    .setThumbnail(playlist.thumbnail || firstSong?.thumbnail)
    .addFields(
      { name: "🎵 Canciones", value: `${playlist.songs?.length || "?"}`, inline: true },
      {
        name: "⏱️ Duración total",
        value: formatDuration(
          (playlist.songs || []).reduce((acc, s) => acc + (s.duration || 0) * 1000, 0)
        ),
        inline: true,
      },
      { name: "📻 Fuente", value: `${source.emoji} ${source.name}`, inline: true }
    )
    .setTimestamp();
}

// ─────────────────────────────────────────
//   EMBED: COLA DE REPRODUCCIÓN
// ─────────────────────────────────────────
function createQueueEmbed(queue, page = 1) {
  const songsPerPage = 10;
  const songs = queue.songs;
  const totalPages = Math.ceil((songs.length - 1) / songsPerPage) || 1;
  page = Math.min(Math.max(page, 1), totalPages);

  const start = (page - 1) * songsPerPage + 1;
  const end = Math.min(start + songsPerPage - 1, songs.length - 1);

  const currentSong = songs[0];
  const source = getMusicSource(currentSong?.url);

  const queueList = songs
    .slice(start, end + 1)
    .map((song, i) => {
      const srcEmoji = song.url?.includes("spotify") ? "🟢" : song.url?.includes("youtube") ? "🔴" : "🎵";
      const name = song.name.length > 45 ? song.name.slice(0, 42) + "..." : song.name;
      return `\`${start + i}.\` ${srcEmoji} **${name}** — \`${formatDuration(song.duration * 1000)}\``;
    })
    .join("\n");

  const totalDuration = songs
    .slice(1)
    .reduce((acc, s) => acc + (s.duration || 0) * 1000, 0);

  const embed = new EmbedBuilder()
    .setColor(COLORS.queue)
    .setAuthor({ name: "📋 Cola de reproducción" })
    .setTitle(`🎵 Reproduciendo: ${currentSong?.name?.slice(0, 50) || "Nada"}`)
    .setThumbnail(currentSong?.thumbnail)
    .addFields({
      name: `📜 Siguiente en la cola (${songs.length - 1} canciones)`,
      value: queueList || "La cola está vacía",
    })
    .addFields(
      {
        name: "⏱️ Tiempo restante",
        value: formatDuration(totalDuration),
        inline: true,
      },
      {
        name: "🔊 Volumen",
        value: `${queue.volume}%`,
        inline: true,
      },
      {
        name: "⚙️ Modo",
        value:
          queue.repeatMode === 1
            ? "🔂 Bucle canción"
            : queue.repeatMode === 2
            ? "🔁 Bucle cola"
            : "▶️ Normal",
        inline: true,
      }
    )
    .setFooter({ text: `Página ${page}/${totalPages}` })
    .setTimestamp();

  return { embed, page, totalPages };
}

// ─────────────────────────────────────────
//   EMBED: ERROR
// ─────────────────────────────────────────
function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setAuthor({ name: "❌ Error" })
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

// ─────────────────────────────────────────
//   EMBED: INFO / ÉXITO
// ─────────────────────────────────────────
function createInfoEmbed(title, description, color = COLORS.info) {
  return new EmbedBuilder()
    .setColor(color)
    .setDescription(`${description}`)
    .setTimestamp();
}

// ─────────────────────────────────────────
//   BOTONES: CONTROLES PRINCIPALES
// ─────────────────────────────────────────
function createMusicButtons(queue) {
  const isLooping = queue?.repeatMode === 1;
  const isLoopingQueue = queue?.repeatMode === 2;
  const isShuffled = queue?.shuffle;
  const isPaused = queue?.paused;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_previous")
      .setEmoji("⏮️")
      .setLabel("Anterior")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("btn_pause")
      .setEmoji(isPaused ? "▶️" : "⏸️")
      .setLabel(isPaused ? "Reanudar" : "Pausar")
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("btn_skip")
      .setEmoji("⏭️")
      .setLabel("Saltar")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("btn_stop")
      .setEmoji("⏹️")
      .setLabel("Detener")
      .setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_loop")
      .setEmoji(isLooping ? "🔂" : "➡️")
      .setLabel(isLooping ? "Loop ON" : "Loop OFF")
      .setStyle(isLooping ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("btn_loop_queue")
      .setEmoji(isLoopingQueue ? "🔁" : "📋")
      .setLabel(isLoopingQueue ? "Cola Loop ON" : "Cola Loop")
      .setStyle(isLoopingQueue ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("btn_shuffle")
      .setEmoji("🔀")
      .setLabel(isShuffled ? "Aleatorio ON" : "Aleatorio")
      .setStyle(isShuffled ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("btn_queue")
      .setEmoji("📋")
      .setLabel("Ver Cola")
      .setStyle(ButtonStyle.Primary)
  );

  return [row1, row2];
}

// ─────────────────────────────────────────
//   BOTONES: NAVEGACIÓN DE COLA
// ─────────────────────────────────────────
function createQueueButtons(page, totalPages) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`queue_page_${page - 1}`)
      .setEmoji("⬅️")
      .setLabel("Anterior")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),

    new ButtonBuilder()
      .setCustomId("queue_refresh")
      .setEmoji("🔄")
      .setLabel("Actualizar")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`queue_page_${page + 1}`)
      .setEmoji("➡️")
      .setLabel("Siguiente")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages)
  );

  return [row];
}

module.exports = {
  createNowPlayingEmbed,
  createAddedEmbed,
  createPlaylistEmbed,
  createQueueEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createMusicButtons,
  createQueueButtons,
  formatDuration,
  createProgressBar,
};
