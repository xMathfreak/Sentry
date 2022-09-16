const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('define')
		.setDescription('Looks for the definition of a word')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Word to describe')
				.setRequired(true)
		),
	async execute(interaction, options) {
		const query = options.get('query').value;

		const results = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
			.then(response => response.json());

		const embed = new EmbedBuilder()
			.setTitle(`Searched for "${query}"`);

		if (!results.length) {
			embed.setDescription('The term could not be found')
				.setColor(15548997);
			await interaction.reply({ embeds: [embed] });
			return;
		}

		let def = new String;
		results.forEach((r, rInd) => {
			r.meanings.forEach((m, mInd) => {
				def = def.concat(`**[${rInd+1}-${mInd+1}]** ${m.definitions[0].definition}\n`);
			});
		});

		embed.setDescription(`Description(s):\n${def.slice(0, 2030)}`);

		await interaction.reply({ embeds: [embed] });
	}
};