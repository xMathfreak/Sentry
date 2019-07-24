const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "s!"
const admprefix = "s@"
  
client.on('error', console.error);
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("s!help | v0.0.3.4a");   
});

client.on("message", async message => {
  let cont = message.content.slice(prefix.length).split(" ");
  let args = cont.slice(1);


//Purge command
if (message.content.startsWith(prefix + 'purge')) {
  async function purge() {
    message.delete();

    if (!message.member.hasPermission(['MANAGE_MESSAGES'])) {
      message.channel.send('You do not have permission to use this command');
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
      .catch(error => message.channel.send('Error: $(error)'));
  }
  purge();
}


if (message.content === prefix+'ping') {
  message.channel.send(new Date().getTime() - message.createdTimestamp + " ms");
}

if (message.content === admprefix+'reset') {

  if (!message.member.hasPermission(['ADMINISTRATOR'])) {
    message.channel.send('You do not have permission to use this command')
    return;
  }

  resetBot(message.channel);
 }

});

function resetBot(channel) {
    channel.send('Rebooting Sentry...')
    .then(message => client.destroy())
    .then(() => client.login('NDI0MjcyOTIzNzYzODAyMTEy.XTicgA.4gvBfUHR8pLhMwAdT8mfeyYavYU'));
}

client.login('NDI0MjcyOTIzNzYzODAyMTEy.XTicgA.4gvBfUHR8pLhMwAdT8mfeyYavYU');
