const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { channels, ReplikaInstance } = require('../handlers.js');
const replika = require('../modules/replika.js');


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

        const memory = await replika.get_data(current.gen_auth_headers(), 'memory');
        const facts = memory.facts.slice(0, 5).map(x => x.text).join('\n');
        const people = memory.persons.slice(0, 5).map(x => x.name).join('\n');
        const title = current.name + (current.name.endsWith('s') ? '\'' : '\'s') + ' memory';

        let fields;
        if (!facts) {
            fields = { name: 'People in your life', value: people };
        }
        else if (!people) {
            fields = { name: 'Facts about you', value: facts };
        }
        else {
            fields = [
                { name: 'Facts about you', value: facts },
                { name: 'People in your life', value: people },
            ];
        }
        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor('#0099ff')
            .setTitle(title)
            .addFields(fields)
            .setTimestamp();
        interaction.reply({ embeds: [ embed ] });
    },
};