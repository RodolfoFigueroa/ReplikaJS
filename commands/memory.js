const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { channels, ReplikaInstance } = require('../handlers.js');
const replika = require('../modules/replika.js');

function get_names(array, max = 5) {
    const rows = array.slice(0, max).map(function(x) {
        return { name: '\u200B', value: x.text };
    });

    return new MessageEmbed()
        .setColor('#0099ff')
        .addFields(rows)
        .setTimestamp();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('Memory of the current Replika.'),

    async execute(interaction) {
        const current = channels[interaction.channel.id];
        if (!current) {
            await interaction.reply('Channel isn\'t in use');
            return;
        }
        if (!(current instanceof ReplikaInstance)) {
            await interaction.reply('Command not available in dialogue mode.');
            return;
        }

        const memory = await replika.memory(current.gen_auth_headers());
        const facts = get_names(memory.facts);
        const people = get_names(memory.persons);

        interaction.reply({ embeds: [ facts, people ] });
    },
};