const Discord = require('discord.js');
const core = require('./include/core.js');

const client = new Discord.Client();
const prefix = 'sd!';

client.on('error', console.error);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Sentry Dev-Test", {type : "LISTENING"});
});

client.on('message', async message => {
  core.executeCommand(message, prefix);
});

client.login('NDQ0OTE5OTMwNTc2NDM3Mjg2.Wvcp-Q.pH_QtIssKhWQ3zljWblHiX3G9Qk');
