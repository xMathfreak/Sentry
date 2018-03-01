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
        message.reply(":ping_pong:" new Date().getTime() - message.createdTimestamp + " ms");
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
