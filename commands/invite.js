module.exports = {
  name: "invite",
  aliases: ["botlink", "bot-link", "invitelink", "invite-link"],
  help: {
    name: "Invite Link",
    description: "Sends a bot invite link in DM",
    usage: "`s!invite`"
  },
  category: "utility",
  execute: async function (message) {
    message.author.send(`https://discordapp.com/oauth2/authorize?client_id=${message.guild.me.id}&scope=bot`);
  }
}