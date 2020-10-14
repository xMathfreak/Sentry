const { splitMessage, escapeMarkdown, MessageEmbed } = require('discord.js');
const YoutubeAPI = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const ytdlDiscord = require('ytdl-core-discord');
const youtube = new YoutubeAPI(process.env.YOUTUBE_API_KEY);
const queue = new Map();

module.exports = {
  play: async function (message, args) {
    const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;

    let serverQueue = queue.get(message.guild.id);
    let vc = message.member.voice;
    const permission = vc.channel.permissionsFor(message.guild.me);

    const search = args.join(' ');
    const url = args[0];
    const urlValid = ytRegex.test(url);

    if (!vc.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (serverQueue && vc.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");
    if (!permission.has('CONNECT')) return message.channel.send("**❌ I do not have permissions to join your voice channel**");
    if (!permission.has('SPEAK')) return message.channel.send("**❌ I do not have permissions to speak in your voice channel**");
    if (!url) return message.channel.send("**❌ You need to specify a song or Youtube link to search for**");

    let song = null;
    let songInfo = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
      } catch (error) {
        console.log(error);

        return message.channel.send("**❌ There was an error playing the song**");
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        if (!results[0]) return message.channel.send("**❌ Song not found**");
        songInfo = await ytdl.getInfo(results[0].url);
      } catch (error) {
        console.log(error);

        return message.channel.send("**❌ There was an error playing the song**");
      }
    }
    
    song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      duration: songInfo.videoDetails.lengthSeconds,
      thumbnail: songInfo.videoDetails.thumbnail.thumbnails[songInfo.videoDetails.thumbnail.thumbnails.length - 1].url,
      author: songInfo.videoDetails.author.name,
      requester: message.author
    };

    if (song.duration >= 10830) return message.channel.send("**❌ Cannot play a song longer than 3 hours**");

    if (!serverQueue) {
      let queueConstruct = {
        textChannel: message.channel,
        voiceChannel: vc.channel,
        connection: null,
        songs: [],
        volume: 100,
        playing: true,
        looping: false
      };

      queue.set(message.guild.id, queueConstruct);
      queueConstruct.songs.push(song);
      
      try {
        let connection = await vc.channel.join();
        queueConstruct.connection = connection;

        const playEmbed = new MessageEmbed()
          .setTitle(escapeMarkdown(queueConstruct.songs[0].title))
          .setURL(queueConstruct.songs[0].url)
          .setThumbnail(queueConstruct.songs[0].thumbnail)
          .setAuthor("Added to queue", queueConstruct.songs[0].requester.avatarURL())
          .addFields({
            name: "Channel",
            value: queueConstruct.songs[0].author,
            inline: true
          }, {
            name: "Song Duration",
            value: formatSeconds(queueConstruct.songs[0].duration),
            inline: true
          });

        message.channel.send(playEmbed);

        playSong(message.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.log(error);
        queue.delete(message.guild.id);
        serverQueue.voiceChannel.leave();

        return message.channel.send("**❌ There was an error playing the song**");
      }
    } else {
      serverQueue.songs.push(song);
      
      const playEmbed = new MessageEmbed()
        .setTitle(escapeMarkdown(song.title))
        .setURL(song.url)
        .setThumbnail(song.thumbnail)
        .setAuthor("Added to queue", song.requester.avatarURL())
        .addFields({
          name: "Channel",
          value: song.author,
          inline: true
        }, {
          name: "Song Duration",
          value: formatSeconds(song.duration),
          inline: true
        });

      message.channel.send(playEmbed);
    }
  },

  stop: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();

    message.channel.send("⏹ **Stopped all tracks**");
  },

  skip: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There is no song to skip**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");
    
    serverQueue.songs[0].looping = false;
    serverQueue.connection.dispatcher.end();
    
    message.channel.send("⏩ **Skipped**");
  },

  nowPlaying: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    nowPlayingEmbed = new MessageEmbed()
      .setTitle(serverQueue.songs[0].title)
      .setURL(serverQueue.songs[0].url)
      .setThumbnail(serverQueue.songs[0].thumbnail)
      .setAuthor("Now Playing ♫")
      .setFooter(`Requested by: ${serverQueue.songs[0].requester.tag}`)
      .addFields({
        name: "Channel",
        value: serverQueue.songs[0].author,
        inline: true
      }, {
        name: "Song Duration",
        value: formatSeconds(serverQueue.songs[0].duration),
        inline: true
      });

    return message.channel.send(nowPlayingEmbed);
  },

  queue: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There are no songs in the queue**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    const description = serverQueue.songs.map((song, index) => (`\`${index}.\` ${song.title} | \`${formatSeconds(song.duration)} Requested by: ${serverQueue.songs[0].requester.tag}\``));
    if (!description[1]) return this.nowPlaying(message);
    description.shift();

    const currentSong = serverQueue.songs[0];

    let queueEmbed = new MessageEmbed()
      .setTitle(`Queue for ${message.guild.name}`)
      .addField("Now Playing", `${currentSong.title} | \`${formatSeconds(currentSong.duration)} Requested by: ${currentSong.requester.tag}\``)
      .addField("Up Next:", "** **");

    const splitDescription = splitMessage(description, {
      maxLength: 1824,
      char: "\n",
      prepend: "",
      append: ""
    });

    splitDescription.forEach(async m => {
      queueEmbed.addField("** **", m);
    });
    message.channel.send(queueEmbed);
  },

  pause: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    if (serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause(true);
      return message.channel.send("⏸ Paused the music");
    }
  },

  resume: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

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
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There is nothing playing**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");

    if (!args.length) return message.channel.send("**❌ You need to insert a position in the queue**");
    if (isNaN(args[0])) return message.channel.send("**❌ You need to specify a number**");

    if (args[0] > serverQueue.songs.length - 1) return message.channel.send("**❌ You need to specify a number in the queue**");
    if (message.author != serverQueue.songs[args[0]].requester || !message.member.hasPermission(['ADMINISTRATOR'])) return message.channel.send("**❌ You cannot remove a song you did not add**");

    const song = serverQueue.songs.splice(args[0], 1);
    message.channel.send(`❎ ${song[0].title} was removed from the queue`);
  },

  volume: async function (message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There are no songs in the queue**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");
    if (isNaN(args[0]) || !args[0]) return message.channel.send('**❌ Please input a number**');
    if (args[0] <= 0 || args[0] > 100) return message.channel.send('**❌ Please input a number greater than 0 and less than 100**');

    serverQueue.volume = args[0];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0]/100);

    message.channel.send(`**🔊 Volume set to ${args[0]}**`);
  },

  loop: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("**❌ You need to be in a voice channel to use this command**");
    if (!serverQueue || !serverQueue.songs[0]) return message.channel.send("**❌ There are no songs in the queue**");
    if (serverQueue && message.member.voice.channel != serverQueue.voiceChannel) return message.channel.send("**❌ You need to be in the same voice channel as me**");
    
    if (serverQueue.looping){
      serverQueue.looping = false;
      message.channel.send(`**🔂 Disabled!**`);
    }else{
      serverQueue.looping = true;
      message.channel.send(`**🔂 Enabled!**`);
    }
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
      if (serverQueue.looping){
        serverQueue.songs.unshift(serverQueue.songs[0]);
      }else{
        serverQueue.songs.shift();
      }
      
      playSong(guild, serverQueue.songs[0]);
    })
    .on('disconnect', () => {
      queue.delete(guild.id);
    })
    .on('error', error => {
      console.error(error);
      serverQueue.voiceChannel.leave();
      serverQueue.textChannel.send("**❌ There was an error while playing the song");
      queue.delete(guild.id);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  if (!serverQueue.looping) serverQueue.textChannel.send(`**Playing**🎶 \`${song.title}\` - Now`);
}

function formatSeconds(seconds) {
  var date = new Date(1970, 0, 1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}
