const { MessageEmbed, Permissions } = require('discord.js');
const userCooldowns = new Set();

module.exports = async (client, message) => {
	const { container } = client;
	const guild = message.guild;
	const prefix = process.env.BOT_PREFIX;

	if (message.author.bot) return;
	if (message.content.indexOf(prefix) != 0) return;

	if (guild) {
		if (!message.member)
			await guild.members.fetch(message.author);

		if (!guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES))
			return;

		if (!message.channel.permissionsFor(guild.me).has(Permissions.FLAGS.SEND_MESSAGES))
			return;
	}

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

	const cmd = container.commands.get(command) || container.commands.get(container.aliases.get(command));
	if (!cmd) return;

	try {
		if (userCooldowns.has(message.author.id)){
			const cooldownEmbed = new MessageEmbed()
				.setTitle('Please wait 5 seconds before using another command!')
				.setColor(13369395);
			return message.channel.send({ embeds: [cooldownEmbed] })
				.then(msg => {
    				setTimeout(() => msg.delete(), 5000)
  				}).catch(console.error);
		} else {
			await cmd.run(client, message, args);

			const logEmbed = new MessageEmbed()
				.setTitle(`${cmd.help.name} command used by ${message.author.tag} in ${message.guild.name}`)
				.setDescription(`Full Command:\n\`${message.content}\``)
				.setColor(5763719)
				.setTimestamp();
			message.guild.me.client.channels.cache.get(process.env.BOT_LOG_CHANNEL).send({ embeds: [logEmbed] });

			userCooldowns.add(message.author.id);
			setTimeout(() => {
				userCooldowns.delete(message.author.id);
			}, 5000);
		}

	}
	catch(e) {
		console.error(e);
		const errorEmbed = new MessageEmbed()
			.setTitle('❌ **An error occurred while running this command!**')
			.setColor(13369395)
			.setTimestamp();
		message.channel.send({ embeds: [errorEmbed] });
	}
}