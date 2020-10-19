const { splitMessage, escapeMarkdown, MessageEmbed } = require('discord.js');
const simpleYT = require('simpleyt');
const ytdl = require('ytdl-core');
const ytdlDiscord = require('ytdl-core-discord');
const { errorMessage } = require('../include/core.js');
const queue = new Map();

module.exports = {
  play: async function (message, args) {
    const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;

    let serverQueue = queue.get(message.guild.id);
    let vc = message.member.voice;
    const permission = vc.channel.permissionsFor(message.guild.me);

    const search = args.join(' ');
    const url = args[0].replace(/\<|\>/g, "");
    const urlValid = ytRegex.test(url);

    if (!vc.channel) return errorMessage(message.channel, "You need to be in a voice channel to use this");
    if (serverQueue && vc.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You need to be in the same voice channel as me");
    if (!permission.has('CONNECT')) return errorMessage(message.channel, "I do not have permissions to join your voice channel");
    if (!permission.has('SPEAK')) return errorMessage(message.channel, "I do not have permissions to join your voice channel");
    if (!url) return errorMessage(message.channel, "I do not have permissions to join your voice channel");

    let song = null;
    let songInfo = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
      } catch (error) {
        console.log(error);
        return errorMessage(message.channel, "There was an error playing the song");
      }
    } else {
      try {
        const results = await simpleYT(search, { filter: 'video'});
        if (!results[0]) return errorMessage(message.channel, "Song not found");
        songInfo = await ytdl.getInfo(results[0].uri);
      } catch (error) {
        console.log(error);
        return errorMessage(message.channel, "There was an error playing the song");
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

    if (song.duration >= 10830) return errorMessage(message.channel, "Cannot play a song longer than 3 hours");

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
            value: new Date(queueConstruct.songs[0].duration * 1000).toISOString().substr(11, 8),
            inline: true
          });

        message.channel.send(playEmbed);

        playSong(message.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.log(error);
        queue.delete(message.guild.id);
        message.guild.me.voice.channel.leave();

        return errorMessage(message.channel, "There was an error playing the song");
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
          value: new Date(song.duration * 1000).toISOString().substr(11, 8),
          inline: true
        });

      message.channel.send(playEmbed);
    }
  },

  stop: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs playing");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice chat as me");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();

    message.channel.send("⏹ **Stopped all tracks**");
  },

  skip: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs to skip")
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You need to be in the same voice channel as me");

    serverQueue.songs[0].looping = false;
    serverQueue.connection.dispatcher.end();

    message.channel.send("⏩ **Skipped**");
  },

  nowPlaying: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me");

    const seek = (serverQueue.connection.dispatcher.streamTime - serverQueue.connection.dispatcher.pausedTime) / 1000;
    const timeLeft = serverQueue.songs[0].duration - seek;

    nowPlayingEmbed = new MessageEmbed()
      .setTitle(escapeMarkdown(serverQueue.songs[0].title))
      .setURL(serverQueue.songs[0].url)
      .setThumbnail(serverQueue.songs[0].thumbnail)
      .setAuthor("Now Playing ♫")
      .setFooter(`Requested by: ${serverQueue.songs[0].requester.tag}`)
      .addField(progressBar(seek, serverQueue.songs[0].duration, 30), `\`${new Date(seek * 1000).toISOString().substr(11, 8)} / ${new Date(serverQueue.songs[0].duration * 1000).toISOString().substr(11, 8)}\``);

    return message.channel.send(nowPlayingEmbed);
  },

  queue: async function (message, args) {
    const serverQueue = queue.get(message.guild.id);
    let page = ~~Math.abs(args[0]) || 1;
    let pageNum = Math.ceil((serverQueue.songs.length - 1) / 5);

    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me")
    if (page == 0) return errorMessage(message.channel, "There are no songs on page 0");
    if (page >= Math.ceil(serverQueue.songs.length / 5) + 1) return errorMessage(message.channel, `Queue ends at ${Math.ceil(serverQueue.songs.length/5)}`);
    if (pageNum == 0) pageNum = 1;

    const currentSong = serverQueue.songs[0];
    const desc = serverQueue.songs.slice(1)
      .slice((page * 5) - 5, (page * 5))
      .map((song, index) => `\`${1+index+((page-1)*5)}.\` [${escapeMarkdown(song.title)}](${song.url}) | \`${new Date(song.duration * 1000).toISOString().substr(11, 8)} Requested by: ${song.requester.tag}\``);

    const splitDesc = splitMessage(desc, {
      maxLength: 1024,
      char: "\n",
      prepend: "",
      append: ""
    });

    const queueEmbed = new MessageEmbed()
      .setTitle(`Queue for ${message.guild.name}`)
      .addField("Now playing", `[${escapeMarkdown(currentSong.title)}](${currentSong.url}) | \`${new Date(currentSong.duration * 1000).toISOString().substr(11, 8)} Requested by: ${currentSong.requester.tag}\``)
      .addField("Up Next", splitDesc[0] || "Nothing")
      .setFooter(`Page ${page}/${pageNum}`, message.author.avatarURL());
    message.channel.send(queueEmbed);
  },

  pause: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me")
    if (serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause(true);
      return message.channel.send("⏸ **Paused the music**");
    }
  },

  resume: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me")
    if (!serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return message.channel.send("▶ **Resumed the music**");
    }

    return errorMessage(message.channel, "The queue was not paused");
  },

  remove: async function (message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me")
    if (!args.length) return errorMessage(message.channel, "You need to insert a position in the queue");
    if (isNaN(args[0])) return errorMessage(message.channel, "You need to specify a number");

    if (args[0] > serverQueue.songs.length - 1) return errorMessage(message.channel, "You need to specify a number in the queue");
    if (message.author != serverQueue.songs[args[0]].requester || !message.member.hasPermission(['MOVE_MEMBERS'])) return errorMessage(message.channel, "You cannot remove a song you did not add");

    const song = serverQueue.songs.splice(args[0], 1);
    message.channel.send(`❎ ${escapeMarkdown(song[0].title)} was removed from the queue`);
  },

  volume: async function (message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me");
    if (isNaN(args[0]) || !args[0]) return errorMessage(message.channel, "Please input a number");
    if (args[0] <= 0 || args[0] > 100) return errorMessage(message.channel, "Please input a number greater than 0 and less than 100");

    serverQueue.volume = args[0];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);

    message.channel.send(`**🔊 Volume set to ${args[0]}**`);
  },

  loop: async function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message.channel, "You have to be in a voice chat to use this command");
    if (!serverQueue || serverQueue.connection.dispatcher==null) return errorMessage(message.channel, "There are no songs in the queue");
    if (serverQueue && message.member.voice.channel != message.guild.me.voice.channel) return errorMessage(message.channel, "You have to be in the same voice channel as me")
    if (serverQueue.looping) {
      serverQueue.looping = false;
      message.channel.send(`**🔂 Disabled!**`);
    } else {
      serverQueue.looping = true;
      message.channel.send(`**🔂 Enabled!**`);
    }
  }
}

async function playSong(guild, song) {
  let serverQueue = queue.get(guild.id);

  if (!song) {
    guild.me.voice.channel.leave();
    queue.delete(guild.id);
    return;
  }

  if (!guild.me.voice.channel) return queue.delete(guild.id);

  const dispatcher = serverQueue.connection.play(await ytdlDiscord(song.url, {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      filter: "audioonly"
    }), {
      type: 'opus'
    }, {
      highWaterMark: 1,
      bitrate: 192000
    })
    .on('finish', () => {
      if (!serverQueue.looping) serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    })
    .on('disconnect', () => {
      queue.delete(guild.id);
    })
    .on('error', error => {
      console.error(error);
      guild.me.voice.channel.leave();
      errorMessage(serverQueue.textChannel, "There was an error while playing the song");
      queue.delete(guild.id);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  if (!serverQueue.looping) serverQueue.textChannel.send(`**Playing**🎶 \`${song.title}\` - Now`);
}

function progressBar(value, maxValue, size){
  const percentage = value / maxValue;
  const progress = Math.round(size * percentage);
  const emptyProgress = size - progress;
  
  const progressText = '█'.repeat(progress);
  const emptyProgressText = '▬'.repeat(emptyProgress);
  
  const bar = `\`\`⟦${progressText}${emptyProgressText}⟧\`\``
  return bar;
}
