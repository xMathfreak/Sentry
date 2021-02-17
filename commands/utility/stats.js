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
    const statsEmbed = new MessageEmbed()
      .addField('Uptime', secondsToDhms(process.uptime()))
      .addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
    message.channel.send(statsEmbed);
  },
};

function secondsToDhms(seconds) {
	seconds = Number(seconds);
	const d = Math.floor(seconds / (3600*24));
	const h = Math.floor(seconds % (3600*24) / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 60);
	
	const dDisplay = d > 0 ? `${d}${(d == 1 ? " day" : " days")}, ` : "";
	const hDisplay = h > 0 ? `${h}${(h == 1 ? " hour" : " hours")}, ` : "";
	const mDisplay = m > 0 ? `${m}${(m == 1 ? " minute" : " minutes")}, ` : "";
	const sDisplay = s > 0 ? `${s}${(s == 1 ? " second" : " seconds")}` : "";
	return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`.trim().replace(/\,$/g, '');
}