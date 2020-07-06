const cheerio = require("cheerio");
const request = require("request");

module.exports = {
  init : {
    delete : false,
    channel : null,
    execute : async function(message, args){
      
      image(message, message.content.split(" "));

    }
  }
}

function image(message, parts){
  var search = parts.slice(1).join(" ");
  var options = {
    url : "https://results.dogpile.com/serp?qc=images&q=" + search,
    method : "GET",
    headers: {
      "Accept" : "text/html",
      "User-Agent" : "Chrome"
    }
  };

  request(options, function (error, response, responseBody){
    if (error){
      return;
    }

    $ = cheerio.load(responseBody);

    var links = $(".image a.link");

    var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

    if (!urls.length){
      return;
    }

    message.channel.send( urls[~~(Math.random() * urls.length)]  );
  });
}
