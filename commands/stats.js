const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { channels, ReplikaInstance } = require('../handlers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Stats for the current Replika.'),

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

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .addFields(
                { name: 'Mood', value: current.exhaustion },
                { name: 'Age', value: current.day_counter + ' days' },
                { name: 'Level', value: current.level.toString(), inline:true },
                { name: 'XP', value: current.xp.toString(), inline:true },
                { name: 'Next level', value: current.xp_gap.toString(), inline:true },
            )
            .setImage(current.avatar)
            .setTimestamp()
            .setAuthor(current.name, current.avatar);

        interaction.reply({ embeds: [embed] });
    },
};