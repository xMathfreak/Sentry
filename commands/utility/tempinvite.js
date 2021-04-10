const { MessageEmbed } = require("discord.js");
const { errorMessage } = require("../../utils/errors");

module.exports = {
  name: 'tempinvite',
  aliases: ['tempinv', 'createtempinv', 'createtempinvite', 'tinv'],
  help: {
    name: 'Temporary Invite',
    description: 'Creates a temporary instant invite',
    usage: '`s!tempinvite [channel]`'
  },
  category: 'utility',
  execute: async function(message, args) {
    const bot = message.guild.me;

    if (!message.member.hasPermission(['CREATE_INSTANT_INVITE'])) return errorMessage(message, 'You do not have permissions to create invites'); 
    if (!bot.hasPermission(['CREATE_INSTANT_INVITE'])) return errorMessage(message, 'I do not have permissions to create invites');
    if (!args[0]) return errorMessage(message, 'Please specify a channel');

    const channel = bot.client.channels.cache.get(args[0]);
    if (!channel) return errorMessage(message, 'Channel not found');

    const invite = await channel.createInvite({maxAge: 0, maxUses: 1}).catch(console.log);

    const inviteEmbed = new MessageEmbed()
      .setTitle(`✉️ Created an invite with link: ${invite}`)
      .setColor(16764160)
      .setFooter(`Requested by: ${message.author.tag}`);
    message.channel.send(inviteEmbed);
  }
};