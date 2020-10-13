const { remove } = require('../include/player.js');

module.exports = {
  name: "remove",
  help: {
    name: "Remove",
    description: "Removes a song from the queue",
    usage: "`s!remove [parameter]`"
  },
  category: "music",
  execute: async function (message, args) {
    remove(message, args);
  }
}