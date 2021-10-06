const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const db = require('../database/commands.js');

async function select_replikas(interaction, max) {
    const filter = i => {
        return i.user.id === interaction.user.id;
    };

    let rows;
    try {
        rows = (await db.list_replikas(interaction.guild.id)).rows;
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

    if (max > rows.length) {
        max = rows.length;
    }
    const selector = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('No Replika selected.')
            .addOptions(buttons)
            .setMinValues(1).setMaxValues(max),
    );

    await interaction.reply({ content: 'Select the Replika you want (the name may not be up-to-date).', components: [selector] });

    let inter;
    try {
        inter = await interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 20000 });
    }
    catch (error) {
        await interaction.channel.send('Interaction timed out.');
        return;
    }

    const selected_replikas = inter.values.map(user_id => replikas[user_id]);
    const selected_names = selected_replikas.map(replika => replika.name);
    let name_string;
    if (selected_names.length == 1) {
        name_string = selected_names[0];
    }
    else {
        name_string = selected_names.slice(0, -1).join(', ') + ' & ' + selected_names.at(-1);
    }
    await inter.reply('Selected ' + name_string);

    return selected_replikas;
}

module.exports = {
    select_replikas: select_replikas,
};