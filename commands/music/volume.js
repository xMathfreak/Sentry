const { volume } = require('../../utils/player.js');

module.exports = {
  name: 'volume',
  help: {
    name: 'Volume',
    description: 'Sets the volume of all songs in the queue',
    usage: '`s!volume [number]`',
  },
  category:'music',
  execute: async function(message, args) {
    volume(message, args);
  },
};