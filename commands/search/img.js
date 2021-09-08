const { MessageEmbed } = require('discord.js');
const gthis = require('googlethis');
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
    const images = await gthis.image(search, { safe: true });

    if (!images.length) return errorMessage(message, 'Couldn\'t find any images based on your search');
    const imageURL = (images.length >= 10) ? images[~~(Math.random() * 10)].url : images[0].url;

    const imageEmbed = new MessageEmbed()
      .setTitle('Image Link')
      .setURL(imageURL)
      .setImage(imageURL)
      .setFooter(`Requested by: ${message.author.tag}`);
    message.channel.send(imageEmbed);
  }
};

