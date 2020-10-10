const { splitMessage, MessageEmbed } = require('discord.js');
const YoutubeAPI = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const ytdlDiscord = require('ytdl-core-discord');
const youtube = new YoutubeAPI(process.env.YOUTUBE_API_KEY);
const queue = new Map();

module.exports = {
  play: async function (message, args) {
    const search = args.join(' ');
    const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;

    let serverQueue = queue.get(message.guild.id);
    let vc = message.member.voice;

    const url = args[0];
    const urlValid = ytRegex.test(url);
    const permissions = vc.channel.permissionsFor(message.guild.me);

    if (!vc.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!url) return message.channel.send("**❌ You need to search for something to play**");
    if (!permissions.has('CONNECT')) return message.channel.send("**❌ I do not have permission to connect to your voice channel**");
    if (!permissions.has('SPEAK')) return message.channel.send("**❌ I do not have permission to speak in your voice channel**");
    if (serverQueue && vc.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    let song = null;
    let songInfo = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          thumbnail: songInfo.videoDetails.thumbnail.thumbnails.last().url,
          author: songInfo.videoDetails.author.name,
          duration: songInfo.videoDetails.lengthSeconds,
          requestedBy: message.author
        };
        if (song.duration > 10830) return message.channel.send("**❌ Cannot play a song that's longer than 3 hours**");
      } catch (error) {
        console.log(error);
        return message.channel.send("**❌ There was an error playing the song**");
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        if (!results[0]) return message.channel.send("**❌ Song not found**");
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          thumbnail: songInfo.videoDetails.thumbnail.thumbnails.last().url,
          author: songInfo.videoDetails.author.name,
          duration: songInfo.videoDetails.lengthSeconds,
          requestedBy: message.author
        };
        if (song.duration > 10830) return message.channel.send("**❌ Cannot play a song that's longer than 3 hours**");
      } catch (error) {
        console.log(error);
        return message.channel.send("**❌ There was an error playing the song**");
      }
    }

    if (!serverQueue) {
      let queueConst = {
        textChannel: message.channel,
        voiceChannel: vc.channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };

      queue.set(message.guild.id, queueConst);
      queueConst.songs.push(song);

      try {
        let connection = await vc.channel.join();
        queueConst.connection = connection;

        message.channel.send({
          embed: {
            title: `${queueConst.songs[0].title}`,
            url: `${queueConst.songs[0].url}`,
            thumbnail: {
              url: `${queueConst.songs[0].thumbnail}`
            },
            author: {
              name: "Added to queue",
              icon_url: `${queueConst.songs[0].requestedBy.avatarURL()}`
            },
            fields: [{
                name: "Channel",
                value: `${queueConst.songs[0].author}`,
                inline: true
              },
              {
                name: "Song Duration",
                value: `${formatSeconds(queueConst.songs[0].duration)}`,
                inline: true
              }
            ]
          }
        });

        playSong(message.guild, queueConst.songs[0]);
      } catch (error) {
        console.log(error);
        queue.delete(message.guild.id);
        serverQueue.voiceChannel.leave()
        return message.channel.send("**❌ There was an error playing the song**");
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send({
        embed: {
          title: `${song.title}`,
          url: `${song.url}`,
          thumbnail: {
            url: `${song.thumbnail}`
          },
          author: {
            name: "Added to queue",
            icon_url: `${song.requestedBy.avatarURL()}`
          },
          fields: [{
              name: "Channel",
              value: `${song.author}`,
              inline: true
            },
            {
              name: "Song Duration",
              value: `${formatSeconds(song.duration)}`,
              inline: true
            }
          ]
        }
      });
    }
  },

  stop: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();

    message.channel.send("⏹ **Stopped all tracks**");
  },

  skip: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is no song to skip**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    serverQueue.connection.dispatcher.end();
    message.channel.send("⏩ **Skipped**");
  },

  nowPlaying: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    return message.channel.send({
      embed: {
        title: `${serverQueue.songs[0].title}`,
        url: `${serverQueue.songs[0].url}`,
        thumbnail: {
          url: `${serverQueue.songs[0].thumbnail}`
        },
        author: {
          name: "Now Playing ♫"
        },
        footer: {
          text: `Requested by: ${serverQueue.songs[0].requestedBy.tag}`
        },
        fields: [{
            name: "Channel",
            value: `${serverQueue.songs[0].author}`,
            inline: true
          },
          {
            name: "Song Duration",
            value: `${formatSeconds(serverQueue.songs[0].duration)}`,
            inline: true
          }
        ]
      }
    });
  },

  queue: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There are no songs in the queue**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    const description = serverQueue.songs.map((song, index) => (`\`${index}.\` ${song.title} | \`${formatSeconds(song.duration)} Requested by: ${serverQueue.songs[0].requestedBy.tag}\``));
    if (!description[1]) return this.nowPlaying(message);
    description.shift();

    const currentSong = serverQueue.songs[0];

    let queueEmbed = new MessageEmbed()
      .setTitle(`Queue for ${message.guild.name}`)
      .addField("Now Playing", `${currentSong.title} | \`${formatSeconds(currentSong.duration)} Requested by: ${currentSong.requestedBy.tag}\``);


    const splitDescription = splitMessage(description, {
      maxLength: 1824,
      char: "\n",
      prepend: "",
      append: ""
    });

    splitDescription.forEach(async m => {
      queueEmbed.addField("Up next:", m);
    });
    message.channel.send(queueEmbed);
  },

  pause: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    if (serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause(true);
      return message.channel.send("⏸ Paused the music");
    }
  },

  resume: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    if (!serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return message.channel.send("▶ Resumed the music");
    }

    return message.channel.send("**❌ The queue was not paused**");
  },

  remove: async function (message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel!=serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    if (!args.length) return message.channel.send("**❌ You need to insert a position in the queue**");
    if (isNaN(args[0])) return message.channel.send("**❌ You need to specify a number**");

    if (args[0] > serverQueue.songs.length - 1) return message.channel.send("**❌ You need to specify a number in the queue**");
    if (message.author != serverQueue.songs[args[0]].requestedBy || !message.member.hasPermission(['ADMINISTRATOR'])) return message.channel.send("**❌ You cannot remove a song you did not add**");

    const song = serverQueue.songs.splice(args[0], 1);
    message.channel.send(`❎ ${song[0].title} was removed from the queue`);
  }
}

async function playSong(guild, song) {
  let serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.play(await ytdlDiscord(song.url, {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      filter: "audioonly"
    }), {
      type: 'opus'
    })
    .on('finish', () => {
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    })
    .on('disconnect', () => {
      queue.delete(guild.id);
    })
    .on('error', error => {
      console.error(error);
      serverQueue.voiceChannel.leave();
      serverQueue.textChannel.send("**❌ There was an error while playing the song").then(message => {
        message.delete({
          timeout: 6000
        });
      });
      queue.delete(guild.id);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`**Playing**🎶 ${"`"+song.title+"`"} - Now`);
}

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
};

if (!Object.prototype.last) {
  Object.prototype.last = function () {
    return this[this.length - 1];
  };
};

function formatSeconds(seconds) {
  var date = new Date(1970, 0, 1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}
