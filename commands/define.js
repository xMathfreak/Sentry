const request = require('request');

module.exports = {
  init : {
    help : {
      name : "Word Search",
      description : "Searches for the definition of a word",
      usage : "`s!define [parameter]`"
    },
    aliases : ["wordsearch", "definition", "def", "explains"],
    execute : async function(message, args){
      getDefinition(message, args);
    }
  }
}

function getDefinition(message, args){
  if (!args[0]){return message.channel.send("**❌ You need to specify a word to search for!**").then(message => {message.delete(6500);}).catch();}

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

    if (!data){return message.channel.send("**❌ There was an error getting the definition**").then(message => {message.delete(6500);}).catch();}
    if (!data[0]){return message.channel.send("**❌ The word couldn't be found**").then(message => {message.delete(6500);}).catch();}

    var meaningsArr = data[0].meanings;
    var tempString = '';

    for(var definitions in meaningsArr){
      if (meaningsArr.hasOwnProperty(definitions)){
        var meaningIndex = parseInt(definitions) + 1;
        tempString = tempString.concat(`${"**[" + meaningIndex + "]** "}`,meaningsArr[definitions].definitions[0].definition, `\n`);
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
          value : `${tempString}`
        }
      ]
    }});

  });
}
