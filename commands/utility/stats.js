const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
	const statsEmbed = new MessageEmbed()
		.setColor(3840407)
		.setThumbnail(client.user.avatarURL())
		.addField('Uptime', secondsToDhms(process.uptime()), true)
		.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, true)
		.addField('\u200b', '\u200b', true)
		.addField('General Stats', `Guilds: ${client.guilds.cache.size}`);
	message.channel.send({embeds: [statsEmbed]});
}

secondsToDhms = (seconds) => {
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

exports.conf = {
	guildOnly : false,
	aliases : []
}

exports.help = {
	name : "Stats",
	description : "Displays information about the bot",
	usage : "stats"
}