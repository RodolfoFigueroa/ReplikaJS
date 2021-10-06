const { SlashCommandBuilder } = require('@discordjs/builders');
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
        const embed = current.stats();
        interaction.reply({ embeds: [embed] });
    },
};