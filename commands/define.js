const request = require('request');

module.exports = {
  init : {
    help : {
      name : "Word Search",
      description : "Searches for the definition of a word",
      usage : "`s!define [parameter]`"
    },
    aliases : ["wordsearch", "definition"],
    execute : async function(message, args){
      getDefinition(message, args);
    }
  }
}

function getDefinition(message, args){
  if (!args[0]){return message.channel.send("**❌ You need to specify a word to search for!**").then(message => {message.delete(3000);}).catch();}

  var options = {
    url : "https://api.dictionaryapi.dev/api/v2/entries/en/" + args,
    method : "GET",
    headers : {
      "Accept" : "text/html",
      "User-Agent" : "Chrome" 
    }
  };

  request(options, function(error, response, responseBody){
    if (error) return;

    var data = JSON.parse(responseBody);

    if (!data || !data[0]){return message.channel.send("**❌ There was an error getting the definition**").then(message => {message.delete(3000);}).catch();}

    var meaningsArr = data[0].meanings;
    var definitionString = '';

    for(var definitions in meaningsArr){
      if (meaningsArr.hasOwnProperty(definitions)){
        var meaningIndex = parseInt(definitions) + 1;
        var definitionsArr = meaningsArr[definitions].definitions;

        for (var definition in definitionsArr){
          if (definitionsArr.hasOwnProperty(definition)){
            var definitionIndex = parseInt(definition) + 1;
            definitionString = definitionString.concat(`${"**[" + meaningIndex + "-" + definitionIndex + "]** "}`,meaningsArr[definitions].definitions[definition].definition, `\n`);
          }
        }
      }
    }

    message.channel.send({embed : {
      title : "",
      fields : [
        {
          "name" : "Word",
          "value" : `${data[0].word}`
        },
        {
          "name" : "Definitions",
          value : `${definitionString}`
        }
      ]
    }});

  });
}