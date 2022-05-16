const { MessageEmbed } = require('discord.js');
const translate = require('translate-google');

exports.run = async (client, message, args) => {
    if (args.length < 2) return;

    const language = args[0];
    const text = args.slice(1).join(' ');
    const correctLanguage = translate.languages.getCode(language);

    const t = await translate(text, { to: correctLanguage }).catch(e => { console.error(e) });

    const translateEmbed = new MessageEmbed()
        .setTitle('Translation')
        .setDescription(t)
        .setFooter({ text: `Requested by ${message.author.tag}` });
    message.channel.send({ embeds: [translateEmbed] });
}

exports.conf = {
    guildOnly : false,
    aliases : ["tl"]
}

exports.help = {
    name : "Translate",
    description : "Translates the given text.",
    usage : "translate [language] [text]"
}