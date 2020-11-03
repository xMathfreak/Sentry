const { errorMessage } = require('../../utils/errors');

module.exports = {
  name: "purge",
  help: {
    name: "Purge",
    description: "Deletes a specified number of messages.",
    usage: "`s!purge [number]`"
  },
  category: "moderation",
  execute: async function (message, args) {
    if (!message.guild.me.hasPermission(['MANAGE_MESSAGES'])) return errorMessage(message, "I do not have permissions to manage messages");
    if (!message.member.hasPermission(['MANAGE_MESSAGES'])) return errorMessage(message, "You do not have permissions to use this command");
    if (isNaN(args[0])) return errorMessage(message, "Please input a number");
    if (args[0] <= 0 || args[0] > 100) return errorMessage(message, "Please input a number greater than 0 and less than 100");
    
    message.delete();
    const fetched = await message.channel.messages.fetch({limit: args[0]});
    message.channel.bulkDelete(fetched).catch(error => errorMessage(message, error));
  }
}