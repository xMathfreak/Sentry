const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const commands = new Collection();
const aliases = new Collection();
const slashcmds = new Collection();

client.container = {
	aliases,
	commands,
	slashcmds
};

const events = fs.readdirSync(`./events`).filter(file => file.endsWith(`.js`));
for (const file of events) {
	const eventName = file.split(`.`)[0];
	const event = require(`./events/${file}`);
	client.on(eventName, event.bind(null, client));
}

const commandsDir = fs.readdirSync(`./commands`);
for (const folder of commandsDir) {
	const categories = fs.readdirSync(`./commands/${folder}`);

	for (file of categories) {
		const commandName = file.split(`.`)[0];
		const command = require(`./commands/${folder}/${file}`);

		command.help.category = folder;
		client.container.commands.set(commandName, command);
		command.conf.aliases.forEach(alias => client.container.aliases.set(alias, commandName));
	}
}

client.login(process.env.BOT_TOKEN);