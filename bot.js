const Discord = require('discord.js');
const core = require('./include/core.js');

const client = new Discord.Client();
const prefix = 's!';

client.on('error', console.error);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("s!help | v0.9", {type : "LISTENING"});
});

client.on('message', async message => {
  core.executeCommand(message, prefix);
});

client.login(process.env.BOT_TOKEN);
