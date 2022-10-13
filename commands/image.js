const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('image')
		.setDescription('Searches for an image')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Image search query')
				.setRequired(true)
		),
	async execute(interaction, options) {
		// Defer reply to avoid Unknown Interaction
		await interaction.deferReply();

		const query = options.get('query').value;
		const opt = {
			url: `http://results.dogpile.com/serp?qc=images&q=${encodeURI(query)}`,
			headers: { cookie: "ws_prefs=vr=1&af=Heavy&sh=False" }
		};

		const response = await cloudscraper.get(opt);
		$ = cheerio.load(response);
		const links = $('.image a.link');
		interaction.urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));

		const embed = new EmbedBuilder()
			.setTitle(`Searched for ${query}`);

		if (!interaction.urls.length) {
			embed.setDescription("No images were found.")
				.setColor(15548997);
			await interaction.editReply({ embeds: [embed] });
			return;
		}

		// Buttons
		let imageIndex = 0;
		let prevButton = new ButtonBuilder()
			.setCustomId("prev_img")
			.setLabel("Previous")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true);
		
		let nextButton = new ButtonBuilder()
			.setCustomId("next_img")
			.setLabel("Next")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(false);

		let row = new ActionRowBuilder()
			.addComponents(prevButton, nextButton);

		// Send the embed and add the Button Collector
		embed.setImage(interaction.urls[imageIndex]);
		const message = await interaction.editReply({ 
			embeds: [embed], 
			components: [row]
		});

		const filter = (interaction) => {
			if (!interaction.isButton) return;
			if (interaction.customId.includes('_img')) return true;
		};

		const collector = message.createMessageComponentCollector({
			filter,
			time: 1000 * 30,
		});

		collector.on('collect', async i => {
			await i.deferUpdate();

			if (i.customId == 'prev_img') {
				imageIndex--;
			} else if (i.customId == 'next_img') {
				imageIndex++;
			}

			//Update buttons
			prevButton.setDisabled(imageIndex == 0);
			nextButton.setDisabled(imageIndex == interaction.urls.length);

			embed.setImage(interaction.urls[imageIndex]);
			await i.message.edit({ embeds: [embed], components: [row] });
		});

		collector.on('end', () => {
			interaction.editReply({ components: [] });
		});
	}
};