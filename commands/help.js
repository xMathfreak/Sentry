const fs = require("fs");

var allCommands = new Map();

fs.readdir("./commands", (err, files) => {
  files.forEach(file => {

    if(file=="main.js"){return;}
    var commandName = file.split(".")[0]
    var importedCommandParams = require("./" + file);
    allCommands.set(commandName, importedCommandParams.init)

  });
})

module.exports = {
  init : {
    delete : false,
    channel : null,
    help: {
      name : "Help",
      description : "Displays all available commands or shows how to use a specified command.",
      usage : "`s!help [command]` or `s!help`"
    },
    execute : async function(message, args){
      var randomColor = Math.floor(Math.random() * 16777215)+1;
      if (!args[0]){
        const commandNames = new Array
        allCommands.forEach(async function(v, k, m){
          commandNames.push("`" + `${k}` + "`");
        });

        message.channel.send({embed : {
          color : randomColor,
          fields : [
            {
              name : "All available commands",
              value : `${commandNames}` 
            }
            
          ]
        }});
      }else{
        allCommands.forEach(async function(v, k, m){
          if (k==args[0]){
            message.channel.send({embed : {
              color : randomColor,
              fields : [
                {
                  name : "Command Name",
                  value : `${v.help.name}`
                },
                {
                  name : "Description",
                  value : `${v.help.description}`
                },
                {
                  name : "Usage",
                  value : `${v.help.usage}`
                }
              ]

            }});
          }
        });
      }
    }
  }
}