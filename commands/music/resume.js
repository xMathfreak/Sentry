const { resume } = require('../../utils/player.js');

module.exports = {
  name: "resume",
  help: {
    name: "Resume",
    description: "Resumes the queue",
    usage: "`s!resume`"
  },
  category: "music",
  execute: async function (message) {
    resume(message);
  }
}