const player = require('../include/player.js');

module.exports = {
  name: "skip",
  help: {
    name: "Skip",
    description: "Skips the current song",
    usage: "`s!skip`"
  },
  execute: async function (message) {
    player.skip(message);
  }
}