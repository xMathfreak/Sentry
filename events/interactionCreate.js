module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		 if (interaction.user.bot)
    		return;
		
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction, interaction.options);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while executing this command.', ephmeral: true});
		}
	}
}