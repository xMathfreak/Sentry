const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
	const id = args[0] || message.author.id;

	if (id.match(/[\#]|[\&]|everyone|here/g)) return;
	const user = client.users.cache.get(id.replace(/\<[\@]|[\!]|\>/g, ''));

	const avatarEmbed = new MessageEmbed()
    	.setTitle(`${user.tag}'s Avatar`)
		.setColor(3840407)
    	.setImage(user.avatarURL({format: 'png', dynamic: true, size: 2048}))
    	.setFooter({ text: `Requested by ${message.author.tag}` });
    message.channel.send({ embeds: [avatarEmbed] });
}

exports.conf = {
	guildOnly : false,
	aliases : ["av", "pfp"]
}

exports.help = {
	name : "Avatar",
	description : "Returns a user's Profile Picture",
	usage : "avatar [user]"
}