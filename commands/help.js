const core = require("../include/core.js");

module.exports = {
  name: "help",
  aliases: ["?"],
  help: {
    name: "Help",
    description: "Displays all available commands or Displays information about a specified command",
    usage: "`s!help` or `s!help [command]`"
  },
  category: "utility",
  execute: async function (message, args) {
    if (!args[0]) {
      message.channel.send({
        embed: {
          title: "All Commands",
          fields: [{
            name: "🎶 Music",
            value: `${getCategory("music")}`,
            inline: false
          },
          {
            name: "🔍 Search",
            value: `${getCategory("search")}`,
            inline: true
          },
          {
            name: "🛠️ Utility",
            value: `${getCategory("utility")}`,
            inline: true
          },
          {
            name:"👮 Moderation",
            value: `${getCategory("moderation")}`,
            inline: false
          }
        ]
        }
      });
    } else {
      core.commands.forEach(async function (value, key, map) {
        if (key == args[0] || (value && value.aliases && value.aliases.includes(args[0]))) {
          message.channel.send({
            embed: {
              color: 16777215,
              fields: [{
                  name: "Command Name",
                  value: `${value.help.name}`
                },
                {
                  name: "Description",
                  value: `${value.help.description}`
                },
                {
                  name: "Usage",
                  value: `${value.help.usage}`
                }
              ]
            }
          });
        }
      });
    }

  }

}

function getCategory(category){
  const array = new Array();
  core.commands.forEach((value) => {
    if(value.category && value.category==category){
      array.push("`"+value.name+"`");
    }
  });

  return array;
}