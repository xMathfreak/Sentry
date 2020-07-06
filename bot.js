const Discord = require("discord.js");
const messages = require("./commands/main.js");

const client = new Discord.Client();
const prefix = "sd!"

client.on("error", console.error);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("sd!help | v0.0.4a", {type : "LISTENING"});
});

client.on("message", async message => {
  messages.ManageMessage(message, prefix);
});

client.login(process.env.BOT_TOKEN)
