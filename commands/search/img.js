const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');
const { errorMessage } = require('../../utils/errors');

module.exports = {
  name: 'image',
  help: {
    name: 'Image Search',
    description: 'Returns an image based on inserted parameters',
    usage: '`s!img [parameters]`',
  },
  category: 'search',
  aliases: ['searchimage', 'findimage', 'imagesearch', 'img'],
  execute: async function(message, args) {
    const search = args.join(' ');
    const options = {
      url: 'https://results.dogpile.com/serp?qc=images&q=' + search,
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Chrome',
      },
    };

    request(options, function(error, response, responseBody) {
      if (error) return;

      $ = cheerio.load(responseBody);
      const links = $('.image a.link');
      const urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));

      if (!urls.length) return errorMessage(message, 'Couldn\'t find any images based on your search');

      const imageURL = (urls.length >= 5) ? urls[~~(Math.random() * 5)] : urls[0];
      const imageEmbed = new MessageEmbed()
        .setTitle('Image Link')
        .setURL(imageURL)
        .setImage(imageURL)
        .setFooter(`Requested by: ${message.author.tag}`);
      message.channel.send(imageEmbed);
    });
  },
};