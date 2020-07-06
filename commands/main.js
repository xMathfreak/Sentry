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

function deleteDesignedMessage(test){
  test.delete().catch(console.error);
}

module.exports = {
  ManageMessage : async function(message, prefix){
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) != 0) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    allCommands.forEach(async function(v, k, m){
      if (k==command){
        if (v.channel != null){
          if (v.channel.name == v.channel){

          }
          else{
            return;
          }
        }
        v.execute(message, args);

        if (v.delete){
          deleteDesignedMessage(message);
        }
      }
    });
  }
}
