const { MessageEmbed } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.run = async (client, message, args) => {
	if (!args[0]) return message.reply("You need to search for a word");
	const query = encodeURIComponent(args.join(' '));
	
	const results = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`).then(response => response.json());
	if (!results.length) return message.reply("An error occurred while searching");
	
	let def = new String;
	results.forEach((r, rInd) => {
		r.meanings.forEach((m, mInd) => {
			def = def.concat(`**[${rInd+1}-${mInd+1}]** ${m.definitions[0].definition}\n`);
		});
	});

	const definitionEmbed = new MessageEmbed()
		.setTitle(`Word: ${results[0].word}`)
		.setDescription(`Description(s):\n${def.slice(0, 2030)}`)
		.setFooter({ text: `Requested by ${message.author.tag}` });
	message.channel.send({ embeds: [definitionEmbed] });
}

exports.conf = {
	guildOnly : false,
	aliases : ["meaning"]
}

exports.help = {
	name : "Define",
	description : "Returns the definition of a word",
	usage : "define [word]"
}