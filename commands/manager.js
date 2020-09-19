const fs = require('fs');
var commands = new Map();
var commandNames = new Array;

fs.readdir("./commands", (err, files) => {
  files.forEach(file => {
    if(file=='manager.js'){return;}
    
    var commandName = file.split(".")[0];
    var importedCommandParams = require("./" + file);
    commandNames.push(`${"`" + commandName + "`"}`)
    commands.set(commandName, importedCommandParams.init);

  });
});

module.exports = {
  commands : commands,
  commandNames : commandNames,
  executeCommand : async function(message, prefix){
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (message.content.indexOf(prefix) != 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    commands.forEach(async function(value, key, map){
      if (key==command || (value && value.aliases && value.aliases.includes(command))){
        value.execute(message, args)
      }
    });
  }
}
