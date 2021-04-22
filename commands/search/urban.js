const { MessageEmbed } = require('discord.js');
const { errorMessage } = require('../../utils/errors');
const fetch = require('node-fetch');

module.exports = {
  name: 'urban',
  help: {
    name: 'Urban Dictionary Search',
    description: 'Searches up a word from Urban Dictionary',
    usage: '`s!urban [parameters]`',
  },
  category: 'search',
  aliases: ['urbandict', 'urbandictionary', 'udict', 'udictionary', 'urbansearch'],
  execute: async function(message, args) {
    if (!args[0]) return errorMessage(message, 'You need to search for a word');
    const query = encodeURIComponent(args.join(' ')); 
    const { list } = await fetch(`http://api.urbandictionary.com/v0/define?term=${query}`).then(response => response.json());
    if (!list.length) return errorMessage(message, 'The word could not be found');

    const urbanEmbed = new MessageEmbed()
      .setTitle(`Word: ${list[0].word}`)
      .setURL(list[0].permalink)
      .setDescription(`**Definition:** \n${(list.length > 2048 ? `${list[0].definition.slice(0, 2048)}...` : list[0].definition).replace(/\[|\]/g, '**')}`)
      .setFooter(`Requested by ${message.author.tag}`);
    message.channel.send(urbanEmbed);
  },
};

