const { loop } = require('../../utils/player.js');

module.exports = {
  name: "loop",
  help: {
    name: "Loop",
    description: "Loops the current song",
    usage: "`s!loop`"
  },
  category:"music",
  execute: async function (message) {
    loop(message);
  }
}