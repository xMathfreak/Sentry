const { skip } = require('../../utils/player.js');

module.exports = {
  name: "skip",
  help: {
    name: "Skip",
    description: "Skips the current song",
    usage: "`s!skip`"
  },
  category: "music",
  execute: async function (message) {
    skip(message);
  }
}