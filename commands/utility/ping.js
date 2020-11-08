module.exports = {
  name: 'ping',
  aliases: ['latency'],
  help: {
    name: 'Ping',
    description: 'Used to test Sentry\'s response time in milliseconds',
    usage: '`s!ping`',
  },
  category: 'utility',
  execute: async function(message) {
    message.channel.send({ embed: { description:`**🏓 Time taken:** ${new Date().getTime() - message.createdTimestamp}ms` } });
  },
};