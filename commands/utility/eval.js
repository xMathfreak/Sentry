const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
	if (message.author.id != process.env.BOT_OWNER_ID) return message.channel.send('https://tenor.com/view/leorio-hxh-hunter-x-hunter-leorio-stare-gif-22601910');

    try {
        const code = args.join(" ");
        let evaled = eval(code);
    } catch(error) {
        console.error(error);
    }
}

exports.conf = {
	guildOnly : false,
	aliases : []
}

exports.help = {
	name : "Eval",
	description : "🤙",
	usage : "eval"
}