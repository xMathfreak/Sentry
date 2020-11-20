const { MessageEmbed } = require('discord.js');
const { errorMessage } = require('../../utils/errors');

module.exports = {
  name: 'avatar',
  aliases: ['pfp', 'profpic', 'icon'],
  help: {
    name: 'Avatar',
    description: 'Fetches a users avatar',
    usage: '`s!avatar [username]`',
  },
  category: 'utility',
  execute: async function(message) {
		let user = (!message.mentions.users.size) ? message.author : message.mentions.users.first();
		const avatarEmbed = new MessageEmbed()
			.setTitle(`${user.tag}'s Avatar`)
			.setImage(user.avatarURL({ format: "png", dynamic: true, size: 1024 }));
		message.channel.send(avatarEmbed)
  },
};
