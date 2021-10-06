const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels, ReplikaInstance, ReplikaDualInstance } = require('../handlers.js');
const db = require('../database/commands.js');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Activates one or two Replikas in the current channel.'),

    async execute(interaction) {
        const guild_id = interaction.guild.id;
        const channel_id = interaction.channel.id;
        const channel = interaction.channel;
        const filter = i => {
            return i.user.id === interaction.user.id;
        };

        if (channels[channel_id]) {
            await interaction.reply('Channel already in use by another Replika. Please diconnect it first.');
            return;
        }

        let rows;
        try {
            rows = (await db.list_replikas(guild_id)).rows;
        }
        catch (error) {
            await interaction.reply('There was an error connecting to the database. Please try again later.');
            return;
        }

        if (rows.length == 0) {
            await interaction.reply('No Replika registered for this server. Please register one first using the `/register` command.');
            return;
        }

        const buttons = rows.map(function(row) {
            return {
                label: row.name,
                value: row.user_id,
            };
        });

        const replikas = {};
        rows.forEach(row => {
            replikas[row.user_id] = row;
        });

        const menu = new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('No Replika selected.')
            .addOptions(buttons);
        if (rows.length > 1) {
            menu.setMinValues(1).setMaxValues(2);
        }

        const selector = new MessageActionRow().addComponents(menu);

        await interaction.reply({ content: 'Select the Replika you want to activate (the name may not be up-to-date).', components: [selector] });

        let inter;
        try {
            inter = await channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 20000 });
        }
        catch (error) {
            await channel.send('Interaction timed out.');
            return;
        }

        if (inter.values.length == 1) {
            await inter.reply('Trying to login...');
            const new_rep = new ReplikaInstance(replikas[inter.values[0]], channel);
            const conn_res = await new_rep.connect();
            if (!conn_res) {
                await inter.editReply('Couldn\'t connect to the Replika server. Please try again later.');
                return;
            }
            await delay(2000);
            if (new_rep.connected) {
                await inter.editReply('Login successful!');
            }
            else {
                await inter.editReply('Couldn\'t connect to the Replika server. Please try again later.');
                new_rep.disconnect();
            }
        }
        else {
            await inter.reply('Two Replikas selected. Starting dialogue mode.');
            const r0 = replikas[inter.values[0]];
            const r1 = replikas[inter.values[1]];

            const new_rep = new ReplikaDualInstance([r0, r1], channel);
            const conn_res = await new_rep.connect();
            if (!conn_res) {
                await inter.editReply('Couldn\'t connect to the Replika server. Please try again later.');
                return;
            }
            await delay(2000);
            if (new_rep.connected.every(Boolean)) {
                await inter.editReply('Login successful!');
            }
            else {
                await inter.editReply('Couldn\'t connect to the Replika server. Please try again later.');
                new_rep.disconnect();
                return;
            }

            await channel.send(`Please type what you want ${r0.name} to hear.`);
            let start;
            try {
                const msg = await channel.awaitMessages({ time: 20000, max: 1, errors: ['time'] });
                start = msg.first().content;
            }
            catch (error) {
                await channel.send('Prompt time exceeded.');
                return;
            }
            new_rep.send(start, 0);
        }
    },
};