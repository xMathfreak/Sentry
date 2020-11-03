const { queue } = require('../../utils/player.js');

module.exports = {
  name: "queue",
  aliases: ["q"],
  help: {
    name: "Queue",
    description: "Shows the music queue",
    usage: "`s!queue`"
  },
  category:"music",
  execute: async function (message, args) {
    queue(message, args);
  }
}