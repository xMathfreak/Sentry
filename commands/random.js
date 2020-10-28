module.exports = {
  name: "random",
  aliases: ["rnd"],
  help: {
    name: "Random",
    description: "Returns a random number between a range or from 0 to a number",
    usage: "`s!random [number]` or `s!random [minumum] [maximum]`"
  },
  category: "utility",
  execute: async function (message, args) {
    if (args[0] && args[1]){
      message.channel.send(`🎲 **${getRandomInt(args[0], args[1])}**`);
    }else if (args[0] && !args[1]){
      message.channel.send(`🎲 **${getRandomInt(0, args[0])}**`);
    }else if (!args[0] && !args[1]){
      message.channel.send(`🎲 **${Math.random()}**`);
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}