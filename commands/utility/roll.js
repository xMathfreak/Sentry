const { MessageEmbed } = require("discord.js");
const { errorMessage } = require("../../utils/errors");

module.exports = {
  name: 'roll',
  aliases: ['diceroll'],
  help: {
    name: 'Dice Roll',
    description: 'Rolls a dice or multiple die',
    usage: '`s!roll [rolls]d[range]`',
  },
  category: 'utility',
  execute: async function(message, args) {
    if (!args[0]) return;
    if (!args[0].match(/\d+d\d+/g)) return;

    const params = args[0].split('d');
    
    if (params[0] > 100) return errorMessage(message, "Cannot generate more than 100 numbers");
    if (params[1] > 2 << 29) return errorMessage(message, `Cannot roll numbers higher than ${2<<29}`);

    const rolls = new Array();

    while (rolls.length < params[0]){
      rolls.push(randInt(0, params[1]));
    }

    const inviteEmbed = new MessageEmbed()
      .setTitle(`🎲 Rolled ${args[0]}`)
      .setDescription(rolls.join(', '))
      .setFooter(`Requested by: ${message.author.tag}`);
    message.channel.send(inviteEmbed);
  },
};


function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
