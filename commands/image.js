const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} = require('discord.js');
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
		// Search for image
		const query = options.get('query').value;
		const opt = {
			url: `http://results.dogpile.com/serp?qc=images&q=${query}`,
			headers: { cookie: "ws_prefs=vr=1&af=Heavy&sh=False" }
		};

		const embed = new EmbedBuilder()
			.setTitle(`Searched for ${query}`);

		const response = await cloudscraper.get(opt);
		$ = cheerio.load(response);
		const links = $('.image a.link');
		interaction.urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));

		if (!interaction.urls.length) {
			embed.setDescription('No images were found.')
				.setColor(15548997);
			await interaction.reply({ embeds: [embed] });
			return;
		}

		//Buttons
		let imageIndex = 0;

		let prevButton = new ButtonBuilder()
			.setCustomId('prev_img')
			.setLabel('Previous')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true);
		let nextButton = new ButtonBuilder()
			.setCustomId('next_img')
			.setLabel('Next')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(false);
		let row = new ActionRowBuilder().addComponents(prevButton, nextButton);

		//Send the image and add the Collector
		embed.setImage(interaction.urls[imageIndex]);
		const message = await interaction.reply({ embeds: [embed], components: [row] });

		const filter = (interaction) => {
			if (!interaction.isButton) return;
			if (interaction.customId.includes('_img')) return true;
		};

		const collector = message.createMessageComponentCollector({
			filter,
			time: 1000 * 15,
		});

		collector.on('collect', async i => {
			i.deferUpdate();

			if (i.customId == 'prev_img') {
				imageIndex--;
			} else if (i.customId == 'next_img') {
				imageIndex++;
			}

			//Update buttons
			prevButton.setDisabled(imageIndex == 0);
			nextButton.setDisabled(imageIndex == interaction.urls.length);

			row = new ActionRowBuilder().addComponents(prevButton, nextButton);

			embed.setImage(interaction.urls[imageIndex]);
			await i.message.edit({ embeds: [embed], components: [row] });
		});

		//Remove buttons to prevent errors
		collector.on('end', () => {
			message.interaction.editReply({ components: [] });
		});
	}
};