// ============================================
//   ⚡ DEPLOY DE SLASH COMMANDS
// ============================================

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

async function deployCommands(client) {
  const commands = [];
  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".js"));

  for (const file of commandFiles) {
    if (file === "README.md") continue;
    const exported = require(path.join(commandsPath, file));
    const cmds = Array.isArray(exported) ? exported : [exported];
    for (const cmd of cmds) {
      if (cmd.data) commands.push(cmd.data.toJSON());
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  await rest.put(Routes.applicationCommands(client.user.id), {
    body: commands,
  });
}

module.exports = { deployCommands };
