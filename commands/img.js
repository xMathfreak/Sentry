const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');
const { errorMessage } = require('../utils/errors.js');

module.exports = {
  name: "image",
  help: {
    name: "Image Search",
    description: "Returns an image based on inserted parameters",
    usage: "`s!img [parameters]`"
  },
  category: "search",
  aliases: ["searchimage", "findimage", "imagesearch", "img"],
  execute: async function (message, args) {
    var search = args.join(' ');
    var options = {
      url: "https://results.dogpile.com/serp?qc=images&q=" + search,
      method: "GET",
      headers: {
        "Accept": "text/html",
        "User-Agent": "Chrome"
      }
    };

    request(options, function (error, response, responseBody) {
      if (error) return;

      $ = cheerio.load(responseBody);
      var links = $(".image a.link");
      var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

      if (!urls.length) return errorMessage(message, "Couldn't find any images based on your search");

      imageURL = urls[~~(Math.random() * urls.length)];
      const imageEmbed = new MessageEmbed()
        .setTitle("Image Link")
        .setURL(imageURL)
        .setImage(imageURL)
        .setFooter(`Requested by: ${message.author.tag}`);
      message.channel.send(imageEmbed);
    });
  }
}
