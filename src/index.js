// ============================================
//   🎵 DISCORD MUSIC BOT — PUNTO DE ENTRADA
// ============================================

require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const fs = require("fs");
const path = require("path");

const { setupDistubeEvents } = require("./handlers/distubeEvents");
const { setupClientEvents } = require("./handlers/clientEvents");
const { deployCommands } = require("./utils/deployCommands");

// ─────────────────────────────────────────
//   CLIENTE DE DISCORD
// ─────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// ─────────────────────────────────────────
//   CARGAR COMANDOS
// ─────────────────────────────────────────
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  if (file === "README.md") continue;
  const exported = require(path.join(commandsPath, file));
  const commands = Array.isArray(exported) ? exported : [exported];

  for (const command of commands) {
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Comando cargado: /${command.data.name}`);
    }
  }
}

// ─────────────────────────────────────────
//   DISTUBE (Motor de música)
// ─────────────────────────────────────────
client.distube = new DisTube(client, {
  plugins: [
    new SpotifyPlugin({
      parallel: true,
      emitEventsAfterFetching: true,
      api: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      },
    }),
    new YtDlpPlugin({ update: false }),
  ],
  emitNewSongOnly: false,
  joinNewVoiceChannel: true,
  nsfw: false,
});

// ─────────────────────────────────────────
//   EVENTOS
// ─────────────────────────────────────────
setupDistubeEvents(client);
setupClientEvents(client);

// ─────────────────────────────────────────
//   LOGIN
// ─────────────────────────────────────────
client.once("ready", async () => {
  console.log(`\n🎵 ¡Bot listo! Conectado como ${client.user.tag}`);
  console.log(`📡 Servidores: ${client.guilds.cache.size}`);

  client.user.setActivity("🎵 /play para música", { type: 2 });

  // Deploy slash commands automáticamente
  try {
    await deployCommands(client);
    console.log("⚡ Slash commands desplegados exitosamente\n");
  } catch (err) {
    console.error("❌ Error al desplegar commands:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
