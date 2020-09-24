const request = require('request');

module.exports = {
	init : {
		help : {
      name : "Urban Dictionary Search",
      description : "Searches for a word on Urban Dictionary",
      usage : "s!urban [parameters]"
    },
    aliases : ["urbandict", "urbandictionary", "udict", "udictionary"],
    execute : async function(message, args){
      getUrbanDefinition(message, args);
    }
	}
}

function getUrbanDefinition(message, args){
  if (!args[0]){return message.channel.send("**❌ You need to specify a word to search for!**").then(message => {message.delete(6000);}).catch();}

  var options = {
    url : "http://api.urbandictionary.com/v0/define?term=" + args,
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
    if (!data.list[0]){return message.channel.send("**❌ The word couldnt be found**").then(message => {message.delete(6500);}).catch();}

    message.channel.send({embed : {
      title : "",
      fields : [
        {
          "name" : "Word",
          "value" : `${data.list[0].word}`
        },
        {
          "name" : "Definition",
          value : `${data.list[0].definition}`
        }
      ]
    }});
  });
}