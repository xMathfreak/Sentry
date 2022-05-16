const { MessageEmbed } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.run = async (client, message, args) => {
	if (!args[0]) return message.reply("You need to search for a word");

	const query = encodeURIComponent(args.join(' '));
	const { list } = await fetch(`http://api.urbandictionary.com/v0/define?term=${query}`).then(response => response.json());

	if (!list.length) return message.reply("The word could not be found");

	const urbanEmbed = new MessageEmbed()
		.setTitle(`Word: ${list[0].word}`)
		.setColor(3840407)
		.setURL(list[0].permalink)
		.setDescription(`**Definition:** \n${(list.length > 2048 ? `${list[0].definition.slice(0, 2048)}...` : list[0].definition).replace(/\[|\]/g, '**')}`)
		.setFooter({ text: `Requested by ${message.author.tag}` });
	message.channel.send({ embeds: [urbanEmbed] });
}

exports.conf = {
	guildOnly : false,
	aliases : ["udict", "urb"]
}

exports.help = {
	name : "Urban Dictionary",
	description : "Searches a term on Urban Dictionary",
	usage : "urban [word(s)]"
}