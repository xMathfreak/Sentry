const Discord = require("discord.js");
const cheerio = require("cheerio");
const request = require("request");
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
  var parts = message.content.split(" ");

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

if (parts[0] === "s!img") {

  image(message, parts);

}

if (message.content === prefix+'ping') {
  message.channel.send("Time taken: " + (new Date().getTime() - message.createdTimestamp) + " ms");
}

if (message.content === admprefix+'reset') {

  if (!message.member.hasPermission(['ADMINISTRATOR'])) {
    message.channel.send('You do not have permission to use this command')
    return;
  }

  resetBot(message.channel);
 }

});

//Functions
function resetBot(channel) {
    channel.send('Rebooting Sentry...')
    .then(message => client.destroy())
    .then(() => client.login(process.env.BOT_TOKEN));
}

function image(message, parts) {
 
  /* extract search query from message */

  var search = parts.slice(1).join(" "); // Slices of the command part of the array ["!image", "cute", "dog"] ---> ["cute", "dog"] ---> "cute dog"

  var options = {
      url: "http://results.dogpile.com/serp?qc=images&q=" + search,
      method: "GET",
      headers: {
          "Accept": "text/html",
          "User-Agent": "Chrome"
      }
  };
  request(options, function(error, response, responseBody) {
      if (error) {
          // handle error
          return;
      }

      /* Extract image URLs from responseBody using cheerio */

      $ = cheerio.load(responseBody); // load responseBody into cheerio (jQuery)

      // In this search engine they use ".image a.link" as their css selector for image links
      var links = $(".image a.link");

      // We want to fetch the URLs not the DOM nodes, we do this with jQuery's .attr() function
      // this line might be hard to understand but it goes thru all the links (DOM) and stores each url in an array called urls
      var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
      console.log(urls);
      if (!urls.length) {
          // Handle no results
          return;
      }

      // Send result
      message.channel.send( urls[0] );
  });

}

client.login(process.env.BOT_TOKEN);
