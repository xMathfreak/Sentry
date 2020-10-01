const cheerio = require('cheerio');
const request = require('request');

module.exports = {
  name: "image",
  help: {
    name: "Image Search",
    description: "Returns an image based on inserted parameters",
    usage: "`s!img [parameters]`"
  },
  category: "search",
  aliases: ["searchimage", "findimage", "imagesearch", "img"],
  execute: async function (message) {
    imageSearch(message, message.content.split(" "));
  }

}

function imageSearch(message, parts) {
  var search = parts.slice(1).join(" ");
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

    if (!urls.length) return message.channel.send("**❌ Couldn't find any images based on the provided parameters**").then(message => {
      message.delete({
        timeout: 6000
      });
    }).catch();

    imageURL = urls[~~(Math.random() * urls.length)]
    message.channel.send({
      embed: {
        "title": "Image Link",
        "url": imageURL,
        "image": {
          "url": imageURL
        }
      }
    });
  });
}