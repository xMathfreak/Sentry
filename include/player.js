const {
  splitMessage
} = require('discord.js');
const YoutubeAPI = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YoutubeAPI(process.env.YOUTUBE_API_KEY);
const queue = new Map();

module.exports = {
  play: async function (message, args) {
    const search = args.join(' ');
    const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistRegex = /^.*(list=)([^#\&\?]*).*/gi;

    let serverQueue = queue.get(message.guild.id);
    let vc = message.member.voice;

    const url = args[0];
    const urlValid = ytRegex.test(url);
    const permissions = vc.channel.permissionsFor(message.guild.me);

    if (!vc.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!url) return message.channel.send("**❌ You need to search for something to play**");
    if (!permissions.has('CONNECT')) return message.channel.send("**❌ I do not have permission to connect to your voice chat**");
    if (!permissions.has('SPEAK')) return message.channel.send("**❌ I do not have permission to speak in your voice chat**");


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
          requestedBy: `${message.author.username}#${message.author.discriminator}`,
          requestAvatar: message.author.avatarURL()
        };
      } catch (error) {
        console.log(error);
        return message.channel.send("**❌ There was an error playing the song**").then(message => {
          message.delete({
            timeout: 6000
          });
        });
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          thumbnail: songInfo.videoDetails.thumbnail.thumbnails.last().url,
          author: songInfo.videoDetails.author.name,
          duration: songInfo.videoDetails.lengthSeconds,
          requestedBy: `${message.author.username}#${message.author.discriminator}`,
          requestAvatar: message.author.avatarURL()
        };
      } catch (error) {
        console.log(error);
        return message.channel.send("**❌ There was an error playing the song**").then(message => {
          message.delete({
            timeout: 6000
          });
        });
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
              icon_url: `${queueConst.songs[0].requestAvatar}`
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
        return message.channel.send("**❌ There was an error playing the song**").then(message => {
          message.delete({
            timeout: 6000
          });
        });
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
            icon_url: `${song.requestAvatar}`
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

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();

    message.channel.send("⏹ **Stopped all tracks**");
  },

  skip: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue) return message.channel.send("**❌ There is no song to skip**");

    serverQueue.connection.dispatcher.end();
    message.channel.send("⏩ **Skipped**");
  },

  nowPlaying: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");

    if (!serverQueue) return message.channel.send("**❌ There is nothing playing**");

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
          text: "Requested by: " + serverQueue.songs[0].requestedBy
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

    const description = serverQueue.songs.map((song, index) => (`\`${index}.\` ${song.title} | \`${formatSeconds(song.duration)} Requested by: ${song.requestedBy}\``));
    if (!description[1]) return this.nowPlaying(message);

    description.shift();
    const splitDescription = splitMessage(description, {
      maxLength: 1824,
      char: "\n",
      prepend: "",
      append: ""
    });
    const currentSong = serverQueue.songs[0];

    splitDescription.forEach(async (m) => {
      message.channel.send({
        embed: {
          title: `Queue for ${message.guild.name}`,
          fields: [{
              name: "Now Playing:",
              value: (`${currentSong.title} | \`${formatSeconds(currentSong.duration)} Requested by: ${currentSong.requestedBy}\``)
            },
            {
              name: "Up next:",
              value: `${m}`
            }
          ]
        }
      })
    });
  }
}

async function playSong(guild, song) {
  let serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.play(ytdl(song.url, {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      filter: "audioonly"
    }))
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
