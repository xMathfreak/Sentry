const { MessageEmbed } = require('discord.js');

module.exports = {
  errorMessage: function(message, content) {
    const errorEmbed = new MessageEmbed()
      .setTitle(`**❌ Error: ${content}**`)
      .setColor(13369395)
      .setTimestamp();
    message.channel.send(errorEmbed);
  },
};