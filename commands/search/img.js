const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
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
    if (!args[0]) return errorMessage(message, 'You need to search for an Image');

    const search = encodeURIComponent(args.join(' '));

    const response = await fetch(`https://results.dogpile.com/serp?qc=images&q=${search}`, {method: 'GET'}).then(response => response.text());
    $ = cheerio.load(response);
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
  }
};

