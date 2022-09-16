const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const translate = require('@vitalets/google-translate-api');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translates text to another language')
		.addStringOption(option =>
			option.setName('language')
				.setDescription('The language to translate to')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('text')
				.setDescription('The text to be translated')
				.setRequired(true)
		),
	async execute(interaction, options) {
		const lang = options.get('language').value;
		const text = options.get('text').value;

		const embed = new EmbedBuilder();

		if (!translate.languages.getCode(lang)) {
			embed.setDescription('The selected language was not found')
				.setColor(15548997);
			await interaction.reply({ embeds: [embed] });
			return;
		}

		const translated = await translate(text, { to: lang });
		
		if (!translated) {
			embed.setDescription('An error occurred while translating')
				.setColor(15548997);
			await interaction.reply({ embeds: [embed] });
			return;
		}
		
		embed.setTitle(`Translating from ${translate.languages[translated.from.language.iso]} to ${translate.languages[lang]}`)
			.addFields(
				{
					name: 'Text',
					value: text
				},
				{
					name: 'Translated',
					value: translated.text
				}
			);
		await interaction.reply({ embeds: [embed] });
	}
};