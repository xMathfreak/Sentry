const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
	const { container } = client;
	const prefix = process.env.BOT_PREFIX;
	const helpEmbed = new MessageEmbed().setColor(3840407);
	const allCategories = getAllCategories(container.commands);

	if (args[0]) {
		const command = args[0].toLowerCase();
		if (allCategories.includes(command)) {
			const category = getCategory(container.commands, command);
			
			helpEmbed.setAuthor({ name: `${command.charAt(0).toUpperCase()}${command.slice(1)} Commands`, iconURL: client.user.avatarURL() })
			.setDescription(category)
			.setFooter({ text: `Use '${prefix}help [command name]' for details on a command.` });
		}
		else if (container.commands.has(command) || container.commands.has(container.aliases.get(command))) {
			com = container.commands.get(command) ?? container.commands.get(container.aliases.get(command));

			helpEmbed.setAuthor({ name: "Command Help", iconURL: client.user.avatarURL() })
			.addField("Command Name", com.help.name)
			.addField("Command Description", com.help.description)
			.addField("Usage", `\`${prefix}${com.help.usage}\``);
		}
	}
	else {
		helpEmbed.setAuthor({ name: "All Command Categories", iconURL: client.user.avatarURL() })
		.setDescription(`A list of all command categories.\nUse \`${prefix}help [category]\` for information on a specific category.\nFor additional information on a command, use \`${prefix}help [command]\`.`)
		.setFooter({ text: `Use '${prefix}help [command name]' for details on a command.` });

		allCategories.forEach(cat => {
			helpEmbed.addField(`${cat.charAt(0).toUpperCase()}${cat.slice(1)}`, `\`${prefix}help ${cat}\``, true);
		});
	}

	message.channel.send({ embeds: [helpEmbed] });
}

exports.conf = {
	guildOnly : false,
	aliases : ["?", "h"]
}

exports.help = {
	name : "Help",
	description : "Returns Information about a command",
	usage : "help [command]"
}

getAllCategories = (commands) => {
	const categories = new Array();
	commands.forEach((v, k) => categories.push(v.help.category));
	return categories.filter((value, index, self) => self.indexOf(value) === index);
}

getCategory = (commands, category) => {
	const cat = new Array();
	commands.forEach((v, k) => {
		if (v.help.category == category)
			cat.push(`\`${k}\``);
	});

	return cat.toString().replace(/((?:[^\,]*\,){4}[^\,]*)\,/gm, '$1\n');
}