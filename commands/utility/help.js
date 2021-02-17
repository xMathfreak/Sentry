const { MessageEmbed } = require('discord.js');
const { commands } = require('../../utils/handler.js');

module.exports = {
  name: 'help',
  aliases: ['?'],
  help: {
    name: 'Help',
    description: 'Displays all available commands or Displays information about a specified command',
    usage: '`s!help` or `s!help [command]`',
  },
  category: 'utility',
  execute: async function(message, args) {
    if (!args[0]) {
      const categoriesEmbed = new MessageEmbed()
        .setTitle('Sentry Command Categories')
        .setDescription('A list of all command categories.\nUse `s!help [category]` for info on a specific category.\nFor additional info on a command, type `s!help [command]`.')
        .addField('🛠️ Utility', '`s!help utility`', true)
        .addField('🔍 Search', '`s!help search`', true)
        .addField('\u200b', '\u200b', true)
        .addField('👮 Moderation', '`s!help moderation`', true)
        .addField('🎶 Music', '`s!help music`', true)
        .addField('\u200b', '\u200b', true);
      message.channel.send(categoriesEmbed);
    }
    else if (args[0] && getAllCategories().includes(args[0].toLowerCase())) {
      const categoryEmbed = new MessageEmbed()
        .setTitle(`${args[0].charAt(0).toUpperCase()}${args[0].slice(1)} Commands`)
        .setDescription(getCategory(args[0].toLowerCase()));
      message.channel.send(categoryEmbed);
    }
    else if (args[0] && commands.has(args[0].toLowerCase())) {
      const command = commands.get(args[0].toLowerCase());
      const commandHelpEmbed = new MessageEmbed()
        .addField('Command Name', command.help.name)
        .addField('Description', command.help.description)
        .addField('Usage', command.help.usage);
      message.channel.send(commandHelpEmbed);
    }
  },
};


function getCategory(category) {
  const array = new Array();
  commands.forEach((value) => {
    if(value.category && value.category == category) {
      array.push(`\`${value.name}\``);
    }
  });

  return array.toString().replace(/((?:[^\,]*\,){4}[^\,]*)\,/gm, '$1\n');
}

function getAllCategories() {
  const categories = new Array();
  commands.forEach(command => categories.push(command.category));
  return categories.filter((value, index, self) => self.indexOf(value) === index);
}