const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "bug",
  aliases: ["reportbug", "bugreport"],
  help: {
    name: "Bug",
    description: "Reports a bug",
    usage: "`s!bug [report]`"
  },
  category: "utility",
  execute: async function (message, args) {
    if (!args) return;

    const bugEmbed = new MessageEmbed()
      .setTitle(`Bug report from ${message.author.tag} in ${message.guild.name}`)
      .setDescription(args.join(' '))
      .setColor(13369395)
      .setTimestamp();
    message.guild.me.client.channels.cache.get(process.env.BUG_LOG_CHANNEL_ID).send(bugEmbed);
    message.channel.send("🦟 **Bug report sent**");
  }
}