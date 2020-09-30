const fs = require('fs');
var commands = new Map();
var commandNames = new Array;

fs.readdir('./commands', (err, files) => {
  files.forEach(file => {
    var importedCommandParams = require(`../commands/${file}`);
    const commandName = importedCommandParams.name;
    commandNames.push(`${"`" + commandName + "`"}`);
    commands.set(commandName, importedCommandParams);

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

    commands.forEach(async function(value, key){
      if (key==command || (value && value.aliases && value.aliases.includes(command))){
        value.execute(message, args).catch(error => {console.log(error)});
      }
    });
  }
}
