const { nowPlaying } = require('../../utils/player.js');

module.exports = {
  name: 'nowplaying',
  aliases: ['np', 'playing'],
  help: {
    name: 'Current Song',
    description: 'Gets the song that is playing',
    usage: '`s!nowplaying`',
  },
  category: 'music',
  execute: async function(message) {
    nowPlaying(message);
  },
};