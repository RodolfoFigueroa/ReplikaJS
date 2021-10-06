const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels } = require('../handlers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Stats for the current Replika.'),

    async execute(interaction) {
        const res = channels[interaction.channel.id];
        if (!res) {
            await interaction.reply('Channel isn\'t in use');
            return;
        }
        const embed = res.replika.stats();
        interaction.reply({ embeds: [embed] });
    },
};