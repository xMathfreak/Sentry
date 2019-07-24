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

      if (message.content === prefix + 'help') { // creates a command *help
        var embedhelpmember = new Discord.RichEmbed() // sets a embed box to the variable embedhelpmember
          .setTitle("**List of Commands**\n") // sets the title to List of Commands
          .addField(" - help", "Displays this message (Correct usage: s!help)") // sets the first field to explain the command *help
          .addField(" - ping", "Pings the bot (Correct usage: s!ping)") // sets the second field to explain the command *ping
          .setColor(0xFFA500) // sets the color of the embed box to orange
          .setFooter("You need help, do you?") // sets the footer to "You need help, do you?"
      }

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


      if (message.content === prefix + 'ping') {
        message.channel.send(new Date().getTime() - message.createdTimestamp + " ms");
      }

      if (message.content === admprefix + 'reset') {

        if (!message.member.hasPermission(['ADMINISTRATOR'])) {
          message.channel.send('You do not have permission to use this command')
          return;
        }

        resetBot(message.channel);
      }

      if (message.content === prefix + 'flip') {
        var result = Math.floor((Math.random() * 2) + 1);
        if (result == 1) {
          message.reply("The coin landed on heads");
        } else if (result == 2) {
          message.reply("The coin landed on tails");
        }}

      });

    function resetBot(channel) {
      channel.send('Rebooting Sentry...')
        .then(message => client.destroy())
        .then(() => client.login('NDI0MjcyOTIzNzYzODAyMTEy.XTiZDA.-byM11A904BZ815LWli-DvMAtNA'));
    }

    client.login('NDI0MjcyOTIzNzYzODAyMTEy.XTiZDA.-byM11A904BZ815LWli-DvMAtNA');
