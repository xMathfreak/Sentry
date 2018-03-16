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
    
    if (message.content === prefix+'ns') {
        message.reply("What the fuck did you just fucking say about me, you little bitch? I’ll have you know I graduated top of my class in the Navy Seals, and I’ve been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I’m the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You’re fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that’s just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little “clever” comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn’t, you didn’t, and now you’re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You’re fucking dead, kiddo.");
    }

    if (message.content === 'Hey Sentry') {
        message.reply('Hi');
    }
    
    if (message.content === 'Henlo') {
        message.reply('https://pics.me.me/henlo-dere-28500676.png');
    }

    if (message.content === "You're mum gay") {
        message.reply('no u');
    }
    
    if (message.content === "you're mum gay") {
        message.reply('no u');
    }
    
    if (message.content === "youre mum gay") {
        message.reply('no u');
    }
    
    if (message.content === "your mum gay") {
        message.reply('no u');
    }
    
    if (message.content === 'henlo') {
        message.reply('https://pics.me.me/henlo-dere-28500676.png');
    }
    
    if (message.content === prefix+'cheekibreeki') {
        message.reply('http://i0.kym-cdn.com/entries/icons/original/000/014/754/cheeki.jpg');
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

client.login('NDE2MjIyNzUwMjI3NjkzNTc5.DY2c9g.v6eENqavN1MnAJP16mGj8h4JZtE');
