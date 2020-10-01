module.exports = {
  name: "purge",
  help: {
    name: "Purge",
    description: "Deletes a specified number of messages.",
    usage: "`s!purge [number]`"
  },
  execute: async function (message, args) {

    async function purge() {
      message.delete();

      if (!message.member.hasPermission(['MANAGE_MESSAGES'])) {
        message.channel.send('**❌ You do not have permission to use this command**')
          .then(message => {
            message.delete({
              timeout: 6000
            });
          }).catch();
        return;
      }

      if (args[0] <= 0) {
        message.channel.send('**❌ Please input a number greater than 0**')
          .then(message => {
            message.delete({
              timeout: 6000
            });
          }).catch();
        return;
      }
      
      if (args[0] > 100) {
        message.channel.send('**❌ Please input a number less than 100**')
          .then(message => {
            message.delete({
              timeout: 6000
            });
          }).catch();
        return;
      }

      if (isNaN(args[0])) {
        message.channel.send('**❌ Please input a number**')
          .then(message => {
            message.delete({
              timeout: 6000
            });
          }).catch();
        return;
      }

      const fetched = await message.channel.messages.fetch({
        limit: args[0]
      });

      message.channel.bulkDelete(fetched)
        .catch(error => message.channel.send('Error: ' + error));
    }
    purge();

  }
}
