const player = require('../include/player.js');

module.exports = {
  name: "queue",
  aliases: ["q"],
  help: {
    name: "Queue",
    description: "Shows the music queue",
    usage: "`s!queue`"
  },
  execute: async function (message) {
    player.queue(message);
  }
}