const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['pfp', 'profpic', 'icon', 'av'],
  help: {
    name: 'Avatar',
    description: 'Fetches a users avatar',
    usage: '`s!avatar [username]`',
  },
  category: 'utility',
  execute: async function(message, args) {
    const client = message.guild.me.client;
    const id = args[0] || message.author.id;

    if (id.match(/[\#]|[\&]|everyone|here/g)) return;

    const user = client.users.cache.get(id.replace(/\<[\@]|[\!]|\>/g, ''));

    const avatarEmbed = new MessageEmbed()
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(user.avatarURL({format: 'png', dynamic: true, size: 2048}))
      .setFooter(`Requested by: ${message.author.tag}`);
    message.channel.send(avatarEmbed);
  }
};
