const manager = require("./manager");

module.exports = {
  init : {
    aliases : ["?"],
    help : {
      name : "Help",
      description : "Displays all available commands or Displays information about a specified command",
      usage : "`s!help` or `s!help [command]`"
    },
    execute : async function(message, args){
      if (!args[0]){
        message.channel.send({
          embed : {
            color : 16777215,
            fields : [
              {
                name : "Command Name",
                value : `${manager.commandNames}`
              }
            ]
          }
        });
      }
      else
      {
        manager.commands.forEach(async function(value, key, map){
          if (key==args[0]){
            message.channel.send({
              embed : {
                color : 16777215,
                fields : [
                  {
                    name : "Command Name",
                    value : `${value.help.name}`
                  },
                  {
                    name : "Description",
                    value : `${value.help.description}`
                  },
                  {
                    name : "Usage",
                    value : `${value.help.usage}`
                  }
                ]
              }
            });
          }
        });
      }

    }
  }
}
