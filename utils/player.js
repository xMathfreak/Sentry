const { splitMessage, escapeMarkdown, MessageEmbed } = require('discord.js');
const { errorMessage } = require('../utils/errors.js');
const { default:youtube } = require('scrape-youtube');
const ytdl = require('discord-ytdl-core');
const ytpl = require('ytpl');

const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.*\?(?!list=).+$/gi;
const plRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.*\?.*\blist=.*$/gi;

const queue = new Map();

module.exports = {
  play : async function(message, args) {
    if (!args[0]) return;

    const search = args.join(' ');
    const url = args[0].replace(/<|>/g, '');

    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    const permission = voiceChannel.permissionsFor(message.guild.me);

    if (!voiceChannel) return errorMessage(message, 'You need to be in a voice channel to use this command');
    if (!permission.has('CONNECT') || !permission.has('SPEAK')) return errorMessage(message, 'I do not have permissions to join or speak in this channel');
    if (!url) return errorMessage(message, 'You need to search for a song');
    if (serverQueue && voiceChannel != message.guild.me.voice.channel) return errorMessage(message, 'We have to be in the same voice channel');

    if (plRegex.test(url)) return module.exports.playlist(message, args);

    let song = null;
    let songInfo = null;

    if (ytRegex.test(url)){
      try{
        songInfo = await ytdl.getInfo(url);
      }
      catch (e){
        console.log(e);
        errorMessage(message, 'An error occurred while finding the song');
        return;
      }
    }
    else{
      try{
        message.channel.send(`🔎 **Searching for:** ${search}`);
        const scrapeResult = await youtube.search(search, { type : 'video' });
        if (!scrapeResult.videos[0]) return errorMessage(message, 'Song not found');
        songInfo = await ytdl.getInfo(scrapeResult.videos[0].link);
      }
      catch (e){
        console.log(e);
        errorMessage(message, 'An error occurred while finding the song');
      }
    }

    song = {
      title     : songInfo.videoDetails.title,
      url       : songInfo.videoDetails.video_url,
      duration  : songInfo.videoDetails.lengthSeconds,
      thumbnail : songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1].url,
      author    : songInfo.videoDetails.author.name,
      requester : message.author,
    };

    if (song.duration > 10900) return errorMessage(message, 'You cannot play a song that\'s longer than 3 hours');

    if (!serverQueue){
      const queueConstruct = {
        textChannel : message.channel,
        voiceChannel : voiceChannel,
        connection : null,
        songs : [],
        volume : 100,
        playing : true,
        looping : false,
      };

      queue.set(message.guild.id, queueConstruct);
      queueConstruct.songs.push(song);

      try {
        const connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        queueConstruct.connection.voice.setSelfDeaf(true);

        const playEmbed = new MessageEmbed()
          .setTitle(escapeMarkdown(queueConstruct.songs[0].title))
          .setURL(queueConstruct.songs[0].url)
          .setThumbnail(queueConstruct.songs[0].thumbnail)
          .setAuthor('Added to Queue', queueConstruct.songs[0].requester.avatarURL())
          .addFields(
            {
              name: 'Channel',
              value: queueConstruct.songs[0].author,
              inline: true,
            },
            {
              name: 'Song Duration',
              value: new Date(queueConstruct.songs[0].duration * 1000).toISOString().substr(11, 8),
              inline: true,
          });
        message.channel.send(playEmbed);

        playSong(message.guild, queueConstruct.songs[0]);
      }
      catch (e){
        queue.delete(message.guild.id);
        await message.guild.me.voice.channel.leave();
        console.log(e);
        errorMessage(message, 'An error occurred while playing the song');
        return;
      }
    }
    else{
      serverQueue.voiceChannel = message.guild.me.voice.channel;
      serverQueue.songs.push(song);

      const playEmbed = new MessageEmbed()
        .setTitle(escapeMarkdown(song.title))
        .setURL(song.url)
        .setThumbnail(song.thumbnail)
        .setAuthor('Added to Queue', song.requester.avatarURL())
        .addFields(
          {
            name: 'Channel',
            value: song.author,
            inline: true,
          }, {
            name: 'Song Duration',
            value: new Date(song.duration * 1000).toISOString().substr(11, 8),
            inline: true,
          }, {
            name: '\u200b',
            value: '\u200b',
            inline: true
          }, {
            name: 'Position in Queue',
            value: serverQueue.songs.length,
            inline: true
        });
      message.channel.send(playEmbed);
    }

  },

  playlist : async function(message, args) {
    if (!args[0] || !args.join(' ').match(plRegex)) return;
    
    const url = args[0].replace(/<|>/g, '');
    
    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    const permission = voiceChannel.permissionsFor(message.guild.me);

    if (!voiceChannel) return errorMessage(message, 'You need to be in a voice channel to use this command');
    if (!permission.has('CONNECT') || !permission.has('SPEAK')) return errorMessage(message, 'I do not have permissions to join or speak in this channel');
    if (!url) return errorMessage(message, 'You need to search for a song');
    if (serverQueue && voiceChannel != message.guild.me.voice.channel) return errorMessage(message, 'We have to be in the same voice channel');

    let list = null;
    let songs = [];

    try {
      list = await ytpl(url);
      list.items.forEach(item => {
        songs.push({
          title     : item.title,
          url       : item.shortUrl,
          duration  : item.durationSec,
          thumbnail : item.bestThumbnail.url,
          requester : message.author,
        })
      });
      message.channel.send({ embed : { description : `Queued **${list.items.length}** songs` }});
    }catch(e){
      if (e.message == 'API-Error: The playlist does not exist.') return errorMessage(message, 'This playlist is either private or does not exist');
      console.log(e);
      errorMessage(message, 'An error occurred while loading this playlist');
      return;
    }
    
    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 100,
        playing: true,
        looping: false,
      };

      queue.set(message.guild.id, queueConstruct);
      songs.forEach(song => queueConstruct.songs.push(song));

      try {
        const connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        queueConstruct.connection.voice.setSelfDeaf(true);

        playSong(message.guild, queueConstruct.songs[0]);
      }
      catch (e) {
        queue.delete(message.guild.id);
        await message.guild.me.voice.channel.leave();
        console.log(e);

        return errorMessage(message, 'There was an error playing the song');
      }
    }
    else{
      serverQueue.voiceChannel = message.guild.me.voice.channel;
      songs.forEach(song => serverQueue.songs.push(song));
    }

  },

  stop: async function(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs to stop');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');

    serverQueue.looping = false;
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();

    message.channel.send('⏹ **Stopped all tracks**');
  },

  skip: async function(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs to skip');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');

    serverQueue.looping = false;
    serverQueue.connection.dispatcher.end();

    message.channel.send('⏩ **Skipped**');
  },

  nowPlaying: async function(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs in the queue');

    const seek = (serverQueue.connection.dispatcher.streamTime - serverQueue.connection.dispatcher.pausedTime) / 1000;

    const nowPlayingEmbed = new MessageEmbed()
      .setTitle(escapeMarkdown(serverQueue.songs[0].title))
      .setURL(serverQueue.songs[0].url)
      .setThumbnail(serverQueue.songs[0].thumbnail)
      .setAuthor('Now Playing ♫')
      .addField(progressBar(seek, serverQueue.songs[0].duration, 32), `\`${new Date(seek * 1000).toISOString().substr(11, 8)} / ${new Date(serverQueue.songs[0].duration * 1000).toISOString().substr(11, 8)} \n\nRequested by: ${serverQueue.songs[0].requester.tag}\``);
    message.channel.send(nowPlayingEmbed);
  },

  queue: async function(message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs in the queue');
    if (!args) page = 1;

    let page = (~~Math.abs(args[0]) >= 1) ? ~~Math.abs(args[0]) : 1;
    const pageNum = (Math.ceil((serverQueue.songs.length - 1) / 5) != 0) ? Math.ceil((serverQueue.songs.length - 1) / 5) : 1;

    if (page >= Math.ceil(serverQueue.songs.length / 5) + 1) return errorMessage(message, `Queue ends at ${Math.ceil(serverQueue.songs.length / 5)}`);

    const currentSong = `**Now Playing:** \n[${serverQueue.songs[0].title.length > 260 ? `${escapeMarkdown(serverQueue.songs[0].title.substring(0, 256))}...` : escapeMarkdown(serverQueue.songs[0].title)}](${serverQueue.songs[0].url}) | \`${new Date(serverQueue.songs[0].duration * 1000).toISOString().substr(11, 8)} Requested by: ${serverQueue.songs[0].requester.tag}\``;
    const upNext = `**Up Next:** \n${serverQueue.songs.length > 1 ? serverQueue.songs.slice(1).slice((page * 5) - 5, page * 5).map((song, index) => `\`${1 + index + ((page - 1) * 5)}.\` [${song.title.length > 260 ? `${escapeMarkdown(song.title.substring(0, 256))}...` : escapeMarkdown(song.title)}](${song.url}) | \`${new Date(song.duration * 1000).toISOString().substr(11, 8)} Requested by: ${song.requester.tag}\``).join('\n') : 'Nothing'}`;
    const splitDesc = splitMessage(`${currentSong}\n${upNext}`, { maxLength: 2048, char: '\n', prepend: '', append: '',});
    const queueEmbed = new MessageEmbed()
      .setTitle(`Queue for ${message.guild.name}`)
      .setDescription(splitDesc[0])
      .setFooter(`Page ${page}/${pageNum}`, message.author.avatarURL())
    message.channel.send(queueEmbed);
  },

  pause: async function(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs to pause');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');

    if (serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause(true);
      message.channel.send('⏸ **Paused the music**');
    }
  },

  resume: async function(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs in the queue');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');

    if (!serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      message.channel.send('▶ **Resumed the music**');
    }
  },

  remove: async function(message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs in the queue');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');
    if (isNaN(args[0])) return errorMessage(message, 'You need to specify a number');
    if (!args.length || args[0] <= 0 || args[0] > serverQueue.songs.length - 1) return errorMessage(message, 'You need to specify a position in the queue');
    if (message.author != serverQueue.songs[args[0]].requester || !message.member.hasPermission(['MOVE_MEMBERS'])) return errorMessage(message, 'You cannot remove a song you did not add');

    const song = serverQueue.songs.splice(args[0], 1);
    message.channel.send(`❎ **${escapeMarkdown(song[0].title)} was removed from the queue**`);
  },

  volume: async function(message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs in the queue');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');
    if (isNaN(args[0]) || !args[0]) return errorMessage(message, 'Please input a number');
    if (args[0] <= 0 || args[0] > 100) return errorMessage(message, 'Please input a number greater than 0 and less than 100');

    serverQueue.volume = args[0];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);

    message.channel.send(`**🔊 Volume set to ${args[0]}**`);
  },

  loop: async function(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel) return errorMessage(message, 'You have to be in a voice channel to use this command');
    if (!serverQueue || !serverQueue.songs[0] || serverQueue.connection.dispatcher == null) return errorMessage(message, 'There are no songs in the queue');
    if (serverQueue && message.member.voice.channel.id != message.guild.me.voice.channel.id) return errorMessage(message, 'You need to be in the same voice channel as me');

    if (serverQueue.looping) {
      serverQueue.looping = false;
      message.channel.send('**🔂 Disabled!**');
    }
    else {
      serverQueue.looping = true;
      message.channel.send('**🔂 Enabled!**');
    }
  }, 
};

async function playSong(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song || !serverQueue.songs.length){
    await guild.me.voice.channel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
	.play(
    ytdl(song.url, {
      quality : 'highestaudio',
      opusEncoded : true,
      filter : 'audioonly',
      highWaterMark : 1 << 22,
    }),
    {
      type : 'opus',
      highWaterMark : 1,
    }
  )
  .on('disconnect', () => {
    queue.delete(guild.id);
    return;
  })
  .on('finish', () => {
    if (!serverQueue.looping) serverQueue.songs.shift();
    playSong(guild, serverQueue.songs[0]);
  })
  .on('error', e => {
    console.log(e);
    guild.me.voice.channel.leave();
    dispatcher.destroy();
    errorMessage(serverQueue.textChannel, 'An error occured while playing the song');
    queue.delete(guild.id);
    return;
  });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  if (!serverQueue.looping) serverQueue.textChannel.send(`🎶 **Now Playing - **\`${song.title}\``);
}

function progressBar(value, maxValue, size) {
  const percentage = value / maxValue;
  const progress = Math.round(size * percentage);
  const emptyProgress = size - progress;

  const progressText = '█'.repeat(progress);
  const emptyProgressText = '▬'.repeat(emptyProgress);

  const bar = `\`\`${progressText}${emptyProgressText}\`\``;
  return bar;
}
