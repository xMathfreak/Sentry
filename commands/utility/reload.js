const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
	if (message.author.id != process.env.BOT_OWNER_ID)
		return;

	if (!args || args.length < 1)
		return message.reply("You must provide a command name to reload!");
	
	const commandName = args[0].toLowerCase();

	if (!client.container.commands.has(commandName))
		return message.reply("This command does not exist!");
	
	delete require.cache[require.resolve(`./${commandName}.js`)];
	client.container.commands.delete(commandName);
	const props = require(`./${commandName}.js`);
	client.container.commands.set(commandName, props);
	
	const reloadEmbed = new MessageEmbed()
		.setTitle('Command Reload')
		.setDescription(`Reloaded command **${commandName}**!`);
	message.channel.send({ embeds: [reloadEmbed] });

	console.log(`Reloaded command \"${commandName}\"!`);
};

exports.conf = {
	guildOnly : false,
	aliases : []
}

exports.help = {
	name : "Reload",
	description : "Reloads a command",
	usage : "reload [command]"
}