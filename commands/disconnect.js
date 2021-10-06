const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels } = require('../handlers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Deactivates the Replika in the current channel.'),

    async execute(interaction) {
        const channel_id = interaction.channel.id;
        const current = channels[channel_id];
        if (!current) {
            console.log('asd');
            await interaction.reply('Channel isn\'t in use.');
            return;
        }
        try {
            await current.replika.disconnect();
            await interaction.reply('Replika disconnected.');
        }
        catch (error) {
            console.log(error);
            await interaction.reply('There was an error disconnecting your Replika. Your settings may have not been saved');
        }
    },
};