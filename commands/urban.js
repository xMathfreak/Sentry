const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Searches Urban Dictionary for a term')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Search query')
				.setRequired(true)
		),
	async execute(interaction, options) {
		const query = options.get('query').value;
		const { list } = await fetch(`http://api.urbandictionary.com/v0/define?term=${query}`)
			.then(response => response.json());
		const embed = new EmbedBuilder()
			.setTitle(`Searched for "${query}"`);

		if (!list.length) {
			embed.setDescription('The term could not be found')
				.setColor(15548997);
			await interaction.reply({ embeds: [embed] });
			return;
		}

		embed.setDescription(`**Definition:** \n${(list.length > 2048 ? `${list[0].definition.slice(0, 2048)}...` : list[0].definition).replace(/\[|\]/g, '**')}`)

		await interaction.reply({ embeds: [embed] });
	}
};