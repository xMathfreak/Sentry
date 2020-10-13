module.exports = {
  name: "purge",
  help: {
    name: "Purge",
    description: "Deletes a specified number of messages.",
    usage: "`s!purge [number]`"
  },
  category: "moderation",
  execute: async function (message, args) {
    if (!message.member.hasPermission(['MANAGE_MESSAGES'])) return message.channel.send('**❌ You do not have permission to use this command**');
    if (isNaN(args[0])) return message.channel.send('**❌ Please input a number**');
    if (args[0] <= 0 || args[0] > 100) return message.channel.send('**❌ Please input a number greater than 0 and less than 100**');

    const fetched = await message.channel.messages.fetch({limit: args[0]});
    message.channel.bulkDelete(fetched).catch(error => message.channel.send(`**❌ Error: ${error}**`));
  }
}