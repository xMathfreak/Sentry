const Discord = require("discord.js");
const client = new Discord.Client();

var prefix = "s!"
var admprefix = "s@"

client.on("message", (message) => {
    // our new check:
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    // [rest of the code]-
  });
  
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", async message => {
    
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    
    if (message.content === prefix+'help') {
        message.reply(  "\n " +
                    "Default prefix is `s!`" +
                    "\n " +
                    "\n " +
                    "Commands:" +
                    "\n`s!help` - Shows this menu" +
                    "\n`s!ping` - Pings the bot" +
                    "\n`s!flip` - Flips a coin"+
                    "\n " +
                    "\n Chat:" +
                    "\n`henlo` - Shows a birb henlo");
    }
 
    if (message.content === prefix+'ping') {
        message.reply(new Date().getTime() - message.createdTimestamp + " ms");
    }

    if (message.content === admprefix+'prune') {
      if (!message.channel.permissionsFor(message.author).hasPermission("MANAGE_MESSAGES")) {
    message.channel.sendMessage("Sorry, you don't have the permission to execute the command \""+message.content+"\"");
    console.log("Sorry, you don't have the permission to execute the command \""+message.content+"\"");
    return;
  } else if (!message.channel.permissionsFor(bot.user).hasPermission("MANAGE_MESSAGES")) {
    message.channel.sendMessage("Sorry, I don't have the permission to execute the command \""+message.content+"\"");
    console.log("Sorry, I don't have the permission to execute the command \""+message.content+"\"");
    return;
  }

  // Only delete messages if the channel type is TextChannel
  // DO NOT delete messages in DM Channel or Group DM Channel
  if (message.channel.type == 'text') {
    message.channel.fetchMessages()
      .then(messages => {
        message.channel.bulkDelete(messages);
        messagesDeleted = messages.array().length; // number of messages deleted

        // Logging the number of messages deleted on both the channel and console.
        message.channel.sendMessage("Deletion of messages successful. Total messages deleted: "+messagesDeleted);
        console.log('Deletion of messages successful. Total messages deleted: '+messagesDeleted)
      })
      .catch(err => {
        console.log('Error while doing Bulk Delete');
        console.log(err);
      });
  }

    if (message.content === 'Hey Sentry') {
        message.reply('Hi');
    }
    
    if (message.content === 'Henlo') {
        message.reply('https://pics.me.me/henlo-dere-28500676.png');
    }
    
    if (message.content === 'henlo') {
        message.reply('https://pics.me.me/henlo-dere-28500676.png');
    }
    
    if (message.content === prefix+'flip') {
        var result = Math.floor((Math.random() * 2) + 1);
    	if (result == 1) {
    		message.reply("The coin landed on heads");
    	} else if (result == 2) {
    		message.reply("The coin landed on tails");
    	}
    }
});
 

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'member-log');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}. Check out our group if you already haven't at https://www.youtube.com/channel/UCXjXTWB_yWIn5El8EJsBcCA?app=desktop`);
});

client.login('NDE2MjIyNzUwMjI3NjkzNTc5.DXCRRw.4O1d2VY5d58CyUeZfhzwE2nT5oU');
