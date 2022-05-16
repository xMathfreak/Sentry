const { MessageEmbed } = require('discord.js');
const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

exports.run = async (client, message, args) => {
	if (!args.length) return;
	const query = encodeURIComponent(args.join(' '));

	const options = {
		url: `http://results.dogpile.com/serp?qc=images&q=${query}`,
		headers: {
			cookie: 'ws_prefs=vr=1&af=Heavy&sh=False'
		}
	};

	const response = await cloudscraper.get(options);
	$ = cheerio.load(response);
	const links = $('.image a.link');
    const urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));

	if (!urls.length) return message.reply(`Couldn't find any images based on your search **"${args.join(' ')}"**`);
	const imageURL = (urls.length >= 5) ? urls[~~(Math.random() * 5)] : urls[0];

	const imageEmbed = new MessageEmbed()
    	.setTitle('Image Link')
		.setColor(3840407)
    	.setURL(imageURL)
    	.setImage(imageURL)
    	.setFooter({ text: `Requested by ${message.author.tag}` });
    message.channel.send({ embeds: [imageEmbed] });
}

exports.conf = {
	guildOnly : false,
	aliases : ["img", "pic"]
}

exports.help = {
	name : "Image",
	description : "Searches for an Image",
	usage : "image [search]"
}