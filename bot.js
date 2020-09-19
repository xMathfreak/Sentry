const Discord = require('discord.js');
const manager = require('./commands/manager.js');

const client = new Discord.Client();
const prefix = 's!';

client.on("error", console.error);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("s!help | v0.0.6", {type : "LISTENING"});
});

client.on("message", async message => {
  manager.executeCommand(message, prefix);
});

client.login(process.env.BOT_TOKEN);
