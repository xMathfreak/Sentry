const { errorMessage } = require('../include/core.js');

module.exports = {
  name: "purge",
  help: {
    name: "Purge",
    description: "Deletes a specified number of messages.",
    usage: "`s!purge [number]`"
  },
  category: "moderation",
  execute: async function (message, args) {
    if (!message.member.hasPermission(['MANAGE_MESSAGES'])) return errorMessage(message.channel, "You do not have permissions to use this command");
    if (isNaN(args[0])) return errorMessage(message.channel, "Please input a number");
    if (args[0] <= 0 || args[0] > 100) return errorMessage(message.channel, "Please input a number greater than 0 and less than 100");
    
    message.delete();
    const fetched = await message.channel.messages.fetch({limit: args[0]});
    message.channel.bulkDelete(fetched).catch(error => errorMessage(message.channel, error));
  }
}