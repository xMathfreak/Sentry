const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription(`Returns the bot's latency in milliseconds`),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setDescription(`🏓 **Latency:** ${Date.now() - interaction.createdTimestamp}ms`);
		await interaction.reply({ embeds: [embed] });
	}
};