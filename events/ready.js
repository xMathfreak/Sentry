module.exports = async client => {
	console.log(`Logged in as ${client.user.tag} on ${client.guilds.cache.size} servers!`);
	client.user.setActivity(`${process.env.BOT_PREFIX}help`, { type: "LISTENING" });
}