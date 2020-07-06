module.exports = {
  init : {
    delete : false,
    channel : null,
    execute : async function(message, args){

      message.channel.send("Time taken: " + (new Date().getTime() - message.createdTimestamp) + " ms");

    }

  }
}
