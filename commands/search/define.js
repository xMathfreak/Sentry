const { splitMessage, MessageEmbed } = require('discord.js');
const { errorMessage } = require('../../utils/errors');
const fetch = require('node-fetch');

module.exports = {
  name: 'define',
  help: {
    name: 'Word Search',
    description: 'Searches for the definition of a word',
    usage: '`s!define [parameter]`',
  },
  category: 'search',
  aliases: ['wordsearch', 'definition'],
  execute: async function(message, args) {
    if (!args[0]) return errorMessage(message, 'You need to search for a word');
    const query = encodeURIComponent(args.join(' ')); 
    const result = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`).then(response => response.json());
    if (!result.length) return;

    let defStr = new String();
    
    result[0].meanings.forEach((meaning, mIndex) => {
      meaning.definitions.forEach((def, dIndex) => {
        defStr = defStr.concat(`**[${mIndex+1}-${dIndex+1}]** ${def.definition}\n`);
      });
    });
    
    const definitionEmbed = new MessageEmbed()
      .setTitle(result[0].word)
      .setDescription(`Description(s):\n${defStr.slice(0, 2030)}`)
      .setFooter(`Requested by ${message.author.tag}`);
    message.channel.send(definitionEmbed);
  },
};