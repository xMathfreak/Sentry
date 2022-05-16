const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
	const pingEmbed = new MessageEmbed()
		.setColor(3840407)
    	.setDescription(`**🏓 Time taken:** ${new Date().getTime() - message.createdTimestamp}ms`);
	message.channel.send({embeds: [pingEmbed]});
}

exports.conf = {
	guildOnly : false,
	aliases : ["latency"]
}

exports.help = {
	name : "Ping",
	description : "Returns the bot's latency in milliseconds",
	usage : "ping"
}