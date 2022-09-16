const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription(`Gives information about the bot`),
	async execute(interaction) {
		const client = interaction.client;

		const embed = new EmbedBuilder()
			.addFields(
				{ 
					name: 'Uptime', 
					value: `${secondsToDhms(process.uptime())}`, 
					inline: true 
				},
				{ 
					name: 'Memory Used', 
					value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, 
					inline: true 
				},
				{ 
					name: 'Servers', 
					value: `${client.guilds.cache.size.toString()}`, 
					inline: true 
				},
				{ 
					name: 'Latency', 
					value: `${Date.now() - interaction.createdTimestamp}ms`, 
					inline: true 
				},
				{ 
					name: 'Creation Date', 
					value: `${client.user.createdAt.toLocaleDateString()}`, 
					inline: true 
				},
			);
		await interaction.reply({ embeds: [embed] });
	}
};

secondsToDhms = (seconds) => {
	seconds = Number(seconds);
	const d = Math.floor(seconds / (3600*24));
	const h = Math.floor(seconds % (3600*24) / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 60);
	
	const dDisplay = d > 0 ? `${d}d ` : "";
	const hDisplay = h > 0 ? `${h}h ` : "";
	const mDisplay = m > 0 ? `${m}m ` : "";
	const sDisplay = s > 0 ? `${s}s` : "";
	return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`.trim().replace(/\,$/g, '');
}