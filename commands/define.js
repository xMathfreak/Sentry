const { splitMessage, MessageEmbed } = require('discord.js');
const request = require('request');

module.exports = {
  name: "define",
  help: {
    name: "Word Search",
    description: "Searches for the definition of a word",
    usage: "`s!define [parameter]`"
  },
  category: "search",
  aliases: ["wordsearch", "definition"],
  execute: async function (message, args) {
    getDefinition(message, args);
  }
}

function getDefinition(message, args) {
  if (!args[0]) return message.channel.send("**❌ You need to specify a word to search for!**");

  var options = {
    url: "https://api.dictionaryapi.dev/api/v2/entries/en/" + args,
    method: "GET",
    headers: {
      "Accept": "text/html",
      "User-Agent": "Chrome"
    }
  };

  request(options, function (error, response, responseBody) {
    if (error) return;

    var data = JSON.parse(responseBody);

    if (!data || !data[0]) return message.channel.send("**❌ There was an error getting the definition**");
    var definitionString = '';

    for (var definitions in data[0].meanings) {
      if (data[0].meanings.hasOwnProperty(definitions)) {
        var meaningIndex = parseInt(definitions) + 1;
        var definitionsArr = data[0].meanings[definitions].definitions;

        for (var definition in definitionsArr) {
          if (definitionsArr.hasOwnProperty(definition)) {
            var definitionIndex = parseInt(definition) + 1;
            definitionString = definitionString.concat(`${"**[" + meaningIndex + "-" + definitionIndex + "]** "}`, data[0].meanings[definitions].definitions[definition].definition, `\n`);
          }
        }
      }
    }

    let defEmbed = new MessageEmbed()
      .setTitle("")
      .addField("Word", `${data[0].word}`)
      .addField("Definitions", "** **")
      .setFooter(`Requested by: ${message.author.tag}`);

    const splitDefinition = splitMessage(definitionString, {
      maxLength: 1000,
      char: "\n",
      prepend: "",
      append: ""
    });

    splitDefinition.forEach(async m => {
      defEmbed.addField("** **", m);
    });
    message.channel.send(defEmbed);
  });
}