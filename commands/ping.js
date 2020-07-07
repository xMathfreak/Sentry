module.exports = {
  init : {
    delete : false,
    channel : null,
    help: {
      name : "Ping",
      description : "Used to test Sentry's response time in milliseconds.",
      usage : "`s!ping`"
    },
    execute : async function(message, args){

      message.channel.send("Time taken: " + (new Date().getTime() - message.createdTimestamp) + " ms");

    }
  }
}