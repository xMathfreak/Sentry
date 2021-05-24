const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'stats',
  help: {
    name: 'Stats',
    description: 'Check bot memory usage and uptime',
    usage: '`s!stats`',
  },
  category: 'utility',
  execute: async function(message) {
    const client = message.guild.me.client;

    const statsEmbed = new MessageEmbed()
      .setThumbnail(client.user.avatarURL())
      .addField('Uptime', secondsToDhms(process.uptime()), true)
      .addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, true)
      .addField('\u200b', '\u200b', true)
      .addField('General Stats', `Guilds: ${client.guilds.cache.size}`);
    message.channel.send(statsEmbed);
  },
};

function secondsToDhms(seconds) {
	seconds = Number(seconds);
	const d = Math.floor(seconds / (3600*24));
	const h = Math.floor(seconds % (3600*24) / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 60);
	
	const dDisplay = d > 0 ? `${d}d ` : "";
	const hDisplay = h > 0 ? `${h}h ` : "";
	const mDisplay = m > 0 ? `${m}m ` : "";
	const sDisplay = s > 0 ? `${s}s` : "";
	return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`.trim().replace(/\,$/g, '');
}