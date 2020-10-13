const { MessageEmbed } = require('discord.js');
const { commands } = require('../include/core.js');

module.exports = {
  name: "help",
  aliases: ["?"],
  help: {
    name: "Help",
    description: "Displays all available commands or Displays information about a specified command",
    usage: "`s!help` or `s!help [command]`"
  },
  category: "utility",
  execute: async function (message, args) {
    if (!args[0]) {
      message.channel.send({
        embed: {
          title: "All Commands",
          fields: [{
            name: "🎶 Music",
            value: `${getCategory("music")}`,
            inline: false
          },
          {
            name: "🔍 Search",
            value: `${getCategory("search")}`,
            inline: true
          },
          {
            name: "🛠️ Utility",
            value: `${getCategory("utility")}`,
            inline: true
          },
          {
            name:"👮 Moderation",
            value: `${getCategory("moderation")}`,
            inline: false
          }
        ]
        }
      });
    } else {
      commands.forEach(async (value, key)=>{
        if (key==args[0] || (value && value.aliases && value.aliases.includes(args[0]))){
          const commandHelpEmbed = new MessageEmbed()
            .addField("Command Name", value.help.name)
            .addField("Description", value.help.description)
            .addField("Usage", value.help.usage);
          message.channel.send(commandHelpEmbed)
        }
      });
    }
  }
}

function getCategory(category){
  const array = new Array();
  commands.forEach((value) => {
    if(value.category && value.category==category){
      array.push(`\`${value.name}\``);
    }
  });
  return array;
}