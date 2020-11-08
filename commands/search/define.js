const { splitMessage, MessageEmbed } = require('discord.js');
const { errorMessage } = require('../../utils/errors');
const request = require('request');

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
    if (!args[0]) return errorMessage(message, 'You need to specify a word to search for');


    const options = {
      url: 'https://api.dictionaryapi.dev/api/v2/entries/en/' + args,
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Chrome',
      },
    };

    request(options, function(error, response, responseBody) {
      if (error) return;

      const data = JSON.parse(responseBody);

      if (!data || !data[0]) return errorMessage(message, 'There was an error retrieving the definition');
      let definitionString = '';

      for (const definitions in data[0].meanings) {
        if (data[0].meanings.hasOwnProperty(definitions)) {
          const meaningIndex = parseInt(definitions) + 1;
          const definitionsArr = data[0].meanings[definitions].definitions;

          for (const definition in definitionsArr) {
            if (definitionsArr.hasOwnProperty(definition)) {
              const definitionIndex = parseInt(definition) + 1;
              definitionString = definitionString.concat(`**[${meaningIndex} - ${definitionIndex}]** `, data[0].meanings[definitions].definitions[definition].definition, '\n');
            }
          }
        }
      }

      const splitDefinition = splitMessage(definitionString, {
        maxLength: 2040,
        char: '\n',
        prepend: '',
        append: '',
      });

      const definitionEmbed = new MessageEmbed()
        .setTitle(`Word: ${data[0].word}`)
        .setFooter(`Requested by: ${message.author.tag}`);

      splitDefinition.forEach(async m => {
        definitionEmbed.setDescription(`**Description(s):** \n ${m}`);
        message.channel.send(definitionEmbed);
      });

    });
  },
};