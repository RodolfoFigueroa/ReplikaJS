const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels, ReplikaInstance } = require('../handlers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Changes the current Replika\'s avatar.'),

    async execute(interaction) {
        const current = channels[interaction.channel.id];
        if (!current) {
            console.log('asd');
            await interaction.reply('Channel isn\'t in use.');
            return;
        }
        if (!(current instanceof ReplikaInstance)) {
            await interaction.reply('Command not available in dialogue mode.');
            return;
        }
        current.ignore = true;
        await interaction.reply('Please enter the URL of your Replika\'s new avatar. The URL must point to a valid image of less than 1MB in size.');
        try {
            const msg = await interaction.channel.awaitMessages({ time: 20000, max: 1, errors: ['time'] });
            const reply = msg.first();
            const res = await current.set_avatar(reply.content);
            if (res) {
                await reply.reply('Avatar successfully changed!');
            }
            else {
                await reply.reply('Couldn\'t open image or image isn\'t valid.');
            }
        }
        catch (error) {
            await interaction.channel.send('Prompt time exceeded.');
            return;
        }
        finally {
            current.ignore = false;
        }
    },
};