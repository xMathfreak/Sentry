const cheerio = require('cheerio');
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
  if (!args[0]){return message.channel.send("**❌ You need to specify a word to search for!**");}

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
    
    if (!data || !data[0]){return message.channel.send("**❌ There was an error getting the definition**");}
    
    message.channel.send({embed : {
      title : "",
      fields : [
        {
          "name" : "Word",
          "value" : `${data[0].word}`
        },
        {
          "name" : "Definition",
          value : `${data[0].meanings[0].definitions[0].definition}`
        }
      ]
    }});

  });
}
