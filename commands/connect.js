const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels, ReplikaInstance, ReplikaDualInstance, active } = require('../handlers.js');
const { select_replikas } = require('../modules/common.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Activate one or two Replikas in the current channel.'),

    async execute(interaction) {
        const channel_id = interaction.channel.id;
        const channel = interaction.channel;

        const current = channels[channel_id];
        if (current) {
            await interaction.reply('Channel is in use by another Replika. Please disconnect it first.');
            return;
        }

        const selected_replikas = await select_replikas(interaction, 2);
        if (!selected_replikas || selected_replikas.length == 0) {
            return;
        }
        else if (selected_replikas.length == 1) {
            const replika = selected_replikas[0];
            if (active.has(replika.user_id)) {
                await interaction.channel.send('Replika is already active. Please disconnect it first.');
                return;
            }

            await interaction.channel.send('Please wait, trying to log in...');
            const new_rep = new ReplikaInstance(replika, channel);
            const conn_res = await new_rep.connect();
            if (conn_res == -1) {
                await interaction.channel.send('Couldn\'t connect to the Replika server. Please try again later.');
                return;
            }
            else if (conn_res == 0) {
                await interaction.channel.send('Device wasn\'t authenticated. Please unregister your Replika with `/unregister` and then register it again.');
                return;
            }

            // TODO: Improve this
            await delay(4000);
            if (new_rep.connected) {
                await interaction.channel.send('Login successful! You may start chatting now.');
            }
            else {
                await interaction.channel.send('Couldn\'t connect to the Replika server. Please try again later.');
                new_rep.disconnect();
            }
        }
        else {
            const [r0, r1] = selected_replikas;
            if (active.has(r0.user_id) || active.has(r1.user_id)) {
                await interaction.channel.send('Replika is already active. Please disconnect it first.');
            }

            const new_rep = new ReplikaDualInstance([r0, r1], channel);
            const conn_res = await new_rep.connect();
            if (!conn_res) {
                await interaction.channel.send('Couldn\'t connect to the Replika server. Please try again later.');
                return;
            }

            // TODO: Improve this.
            await delay(2000);
            if (new_rep.connected.every(Boolean)) {
                await interaction.channel.send('Login successful!');
            }
            else {
                await interaction.channel.send('Couldn\'t connect to the Replika server. Please try again later.');
                await new_rep.disconnect();
                return;
            }

            await channel.send(`Please type what you want ${r0.name} to hear. Keep in mind ${r1.name} won't know they said it. Use \`/disconnect\` at any time to stop.`);
            let start;
            try {
                const msg = await channel.awaitMessages({ time: 20000, max: 1, errors: ['time'] });
                start = msg.first().content;
            }
            catch (error) {
                await channel.send('Prompt time exceeded.');
                await new_rep.disconnect();
                return;
            }
            new_rep.send(start, 0);
        }
    },
};