const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels } = require('../handlers.js');
const { select_replikas } = require('../modules/common.js');
const db = require('../database/commands.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Unregisters a Replika.'),

    async execute(interaction) {
        const current = channels[interaction.channel.id];
        if (current) {
            await interaction.reply('Channel is in use by another Replika. Please disconnect it first.');
            return;
        }

        const selected_replika = await select_replikas(interaction, 1);
        const res = await db.delete_replika(selected_replika[0].user_id);
        if (res) {
            await interaction.channel.send('Replika unregistered successfully.');
        }
        else {
            await interaction.channel.send('There was an error deleting this Replika.');
        }
    },
};