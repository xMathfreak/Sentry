module.exports = {
  init : {
    delete : false,
    channel : null,
    execute : async function(message, args){
      
      async function purge() {
        message.delete();
    
        if (!message.member.hasPermission(['MANAGE_MESSAGES'])) {
          message.channel.send('You do not have permission to use this command');
          return;
        }

        if (args[0] <= 0){
          message.channel.send('Please input a number greater than 0');
          return;
        }
    
        if (isNaN(args[0])) {
          message.channel.send('Please input a number');
          return;
        }
    
        const fetched = await message.channel.fetchMessages({
          limit: args[0]
        });
        console.log(fetched.size + 'message(s) found, deleting...');
    
        message.channel.bulkDelete(fetched)
          .catch(error => message.channel.send('Error: ' + error));
      }
      purge();

    }
  }
}
