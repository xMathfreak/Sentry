const Discord = require("discord.js");
const client = new Discord.Client();
const talkedRecently = new Set();

var prefix = "s!"
var admprefix = "s@"

client.on("message", (message) => {
    // our new check:
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    // [rest of the code]-
  });
  
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("sd!help | v0.0.3a");   
});

client.on("message", async message => {
const args = message.content.slice(prefix.length).trim().split(/ +/g);

if (talkedRecently.has(message.author.id)) {
    message.channel.send("Wait 15 seconds before typing this again. - " + message.author);
} else {
    
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
    
    if (message.content === admprefix+'reset') {
        resetBot(message.channel);
    }

    if (message.content === prefix+'prune') {
        const amount = parseInt(args[0]) + 1;

		if (isNaN(amount)) {
			return message.reply('that doesn\'t seem to be a valid number.');
		}
		else if (amount <= 1 || amount > 100) {
			return message.reply('you need to input a number between 1 and 99.');
		}

		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err);
			message.reply('there was an error trying to prune messages in this channel!');
		});
    }
    
    if (message.content === prefix+'server') {
		message.reply(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    }
    
    if (message.content === prefix+'user-info') {
		message.reply(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    }
    
    if (message.content === 'Hey Sentry') {
        message.reply('Hi');
    }
    
    if (message.content === prefix+'flip') {
        var result = Math.floor((Math.random() * 2) + 1);
    	if (result == 1) {
    		message.reply("The coin landed on heads");
    	} else if (result == 2) {
    		message.reply("The coin landed on tails");
    	}
    }

    talkedRecently.add(message.author.id);
    setTimeout(() => {
      // Removes the user from the set after a minute
      talkedRecently.delete(message.author.id);
    }, 5000);
}
});

function resetBot(channel) {
    // send channel a message that you're resetting bot [optional]
    channel.send('Rebooting Sentry...')
    .then(message => client.destroy())
    .then(() => client.login('NDI0MjcyOTIzNzYzODAyMTEy.DeCoCg.tYOG6ede6Ii-1ci2oD2sN2qph9A'));
}

client.login('NDI0MjcyOTIzNzYzODAyMTEy.DeCoCg.tYOG6ede6Ii-1ci2oD2sN2qph9A');
