const { stop } = require('../../utils/player.js');

module.exports = {
  name: 'stop',
  help: {
    name: 'Stop',
    description: 'Stops all songs in the queue',
    usage: '`s!stop`',
  },
  category:'music',
  execute: async function(message) {
    stop(message);
  },
};