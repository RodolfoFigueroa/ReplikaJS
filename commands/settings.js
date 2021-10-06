const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { channels, ReplikaInstance } = require('../handlers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Edit the current Replika\'s settings.'),

    async execute(interaction) {
        const current = channels[interaction.channel.id];
        const filter = m => {
            return m.author.id === interaction.user.id;
        };

        if (!current) {
            await interaction.reply('Channel isn\'t in use.');
            return;
        }
        if (!(current instanceof ReplikaInstance)) {
            await interaction.reply('Command not available in dialogue mode.');
            return;
        }
        current.ignore = true;

        let row = new MessageActionRow().addComponents (
            new MessageButton()
                .setCustomId('avatar')
                .setLabel('Change Replika\'s avatar')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('prefix')
                .setLabel('Change prefix style')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('DANGER'),
        );
        await interaction.reply({ content: 'What do you want to do?', components: [row] });
        let inter;
        try {
            inter = await interaction.channel.awaitMessageComponent({ ComponentType: 'BUTTON', time: 20000 });
        }
        catch (error) {
            await interaction.channel.send('Interaction timed out.');
            return;
        }

        if (inter.customId == 'avatar') {
            await inter.reply('Please enter the URL of your Replika\'s new avatar. The URL must point to a valid image of less than 1MB in size.');
            try {
                const msg = await interaction.channel.awaitMessages({ filter, time: 20000, max: 1, errors: ['time'] });
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
        }

        else if (inter.customId == 'prefix') {
            row = new MessageActionRow().addComponents (
                new MessageButton()
                    .setCustomId('none')
                    .setLabel('No prefix')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('partial')
                    .setLabel('Partial prefixes (S, G, D)')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('full')
                    .setLabel('Full prefixes (script, GPT, dialog)')
                    .setStyle('PRIMARY'),
            );
            await inter.reply({ content: 'Select a prefix style.', components: [row] });
            try {
                inter = await interaction.channel.awaitMessageComponent({ ComponentType: 'BUTTON', time: 20000 });
                current.prefix = inter.customId;
                await inter.reply('Prefix style set.');
            }
            catch (error) {
                await interaction.channel.send('Interaction timed out.');
                return;
            }
            finally {
                current.ignore = false;
            }
        }

        else if (inter.customId == 'cancel') {
            await interaction.channel.send('Interaction canceled.');
            current.ignore = false;
            return;
        }
    },
};