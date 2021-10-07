const { SlashCommandBuilder } = require('@discordjs/builders');
const { registering, active, channels } = require('../handlers.js');
const db = require('../database/commands.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const replika = require('../modules/replika.js');

async function prompt_login(interaction) {
    const guild_id = interaction.guild.id;

    await interaction.reply('Please check your DMs.');
    const dm_channel = await interaction.user.createDM();
    const row = new MessageActionRow().addComponents (
        new MessageButton()
            .setCustomId('password')
            .setLabel('Username and password')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('tokens')
            .setLabel('Authentication tokens')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('cancel')
            .setLabel('Cancel registration')
            .setStyle('DANGER'),
    );
    await dm_channel.send({ content: 'Please select your login method.', components: [row] });

    let inter;
    try {
        inter = await dm_channel.awaitMessageComponent({ ComponentType: 'BUTTON', time: 20000 });
    }
    catch (error) {
        await dm_channel.send('Interaction timed out.');
        return -1;
    }

    let auth_tokens = {};
    if (inter.customId == 'password') {
        let username, password;
        await inter.reply('Starting registration by username and password. Type "cancel" at any point to exit.');

        await dm_channel.send('Please enter your Replika username.');
        try {
            const msg = await dm_channel.awaitMessages({ time: 20000, max: 1, errors: ['time'] });
            username = msg.first().content;
            if (username == 'cancel') {
                await dm_channel.send('Registration canceled.');
                return 0;
            }
        }
        catch (error) {
            console.log(error);
            await dm_channel.send('Registration time exceeded.');
            return -1;
        }

        await dm_channel.send('Please enter your Replika password.');
        try {
            const msg = await dm_channel.awaitMessages({ time: 20000, max: 1, errors: ['time'] });
            password = msg.first().content;
            if (password == 'cancel') {
                await dm_channel.send('Registration canceled.');
                return 0;
            }
        }
        catch (error) {
            await dm_channel.send('Registration time exceeded.');
            return -1;
        }

        await dm_channel.send('Trying to log in...');
        try {
            auth_tokens = await replika.login(username, password);
            await dm_channel.send('Login succesful!');
        }
        catch (error) {
            await dm_channel.send('Wrong username or password. Please try again.');
            return -1;
        }
    }

    else if (inter.customId == 'tokens') {
        await inter.reply('Starting registration by auth tokens. It\'s your responsibility to make sure they are correct. Type "cancel" at poiint to exit.');

        await dm_channel.send('Please enter your user ID.');
        try {
            const msg = await dm_channel.awaitMessages({ time: 30000, max: 1, errors: ['time'] });
            const res = msg.first().content;
            if (res == 'cancel') {
                await dm_channel.send('Registration canceled.');
                return 0;
            }
            else {
                auth_tokens['x-user-id'] = res;
            }
        }
        catch (error) {
            console.log(error);
            await dm_channel.send('Registration time exceeded.');
            return -1;
        }

        await dm_channel.send('Please enter your auth token.');
        try {
            const msg = await dm_channel.awaitMessages({ time: 30000, max: 1, errors: ['time'] });
            const res = msg.first().content;
            if (res == 'cancel') {
                await dm_channel.send('Registration canceled.');
                return 0;
            }
            else {
                auth_tokens['x-auth-token'] = res;
            }
        }
        catch (error) {
            console.log(error);
            await dm_channel.send('Registration time exceeded.');
            return -1;
        }

        await dm_channel.send('Please enter your device ID.');
        try {
            const msg = await dm_channel.awaitMessages({ time: 30000, max: 1, errors: ['time'] });
            const res = msg.first().content;
            if (res == 'cancel') {
                await dm_channel.send('Registration canceled.');
                return 0;
            }
            else {
                auth_tokens['x-device-id'] = res;
            }
        }
        catch (error) {
            console.log(error);
            await dm_channel.send('Registration time exceeded.');
            return -1;
        }

        auth_tokens['x-timestamp-hash'] = replika.gen_timestamp_hash(auth_tokens['x-device-id']);
        await dm_channel.send('Verifying tokens...');
        try {
            await replika.get_data(auth_tokens, 'profile');
            await dm_channel.send('Tokens are correct!');
        }
        catch (error) {
            await dm_channel.send('Wrong tokens, please try again.');
            return -1;
        }
    }

    else {
        await inter.reply('Registration canceled');
        return 0;
    }

    // Building data dictionaries
    const user_id = auth_tokens['x-user-id'];
    const params = {
        ...auth_tokens,
        guild_id: guild_id,
    };

    try {
        await replika.get_data(auth_tokens, 'profile');
        const res = await replika.get_data(auth_tokens, 'chat');
        params.chat_id = res.id;
        params.bot_id = res.bot_id.id;

        const profile_data = await replika.get_data(auth_tokens, 'profile');
        params.name = profile_data.name;
        params.avatar = profile_data.avatar_v2.preview;
    }
    catch (error) {
        await dm_channel.send('Couldn\'t connect to Replika server. Please try again later.');
        return -1;
    }

    /* Registering Replika */
    const regis = await db.is_registered(user_id, guild_id);
    // error
    if (regis == -1) {
        await dm_channel.send('There was an error registering your Replika. Please try again.');
        return -1;
    }
    // replika doesn't exist
    else if (regis == 0) {
        const res = await db.insert_replika(params);
        if (res) {
            await dm_channel.send('Registration successful! You can go back to the server.');
            return 1;
        }
        else {
            await dm_channel.send('There was an error registering your Replika. Please try again.');
            return -1;
        }
    }
    // replika registered in this server
    else if (regis == 1) {
        await dm_channel.send('Replika already registered in this server, no need to register it again.');
        return 1;
    }
    // replika registered in another server
    else {
        const qrow = new MessageActionRow().addComponents (
            new MessageButton()
                .setCustomId('yes')
                .setLabel('Yes')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('no')
                .setLabel('No')
                .setStyle('DANGER'),
        );
        await dm_channel.send({
            content: 'Replika already registered in another server. Would you like to remove it from there and add it here?.',
            components: [qrow],
        });

        let qinter;
        try {
            qinter = await dm_channel.awaitMessageComponent({ ComponentType: 'BUTTON', time: 20000 });
        }
        catch (error) {
            await dm_channel.send('Interaction timed out.');
            return -1;
        }
        if (qinter.customId == 'yes') {
            await qinter.reply('Trying to unregister Replika.');
            if (active.has(user_id)) {
                await dm_channel.send('Replika is active in another server. Disconnect it first');
                return -1;
            }
            let res = await db.delete_replika(user_id);
            if (res) {
                await dm_channel.send('Replika unregistered successfully. Trying to register in this server.');
            }
            else {
                await dm_channel.send('There was an error deleting this Replika. Please try again later.');
                return -1;
            }
            res = await db.insert_replika(params);
            if (res) {
                await dm_channel.send('Registration successful! You can go back to the server.');
                return 1;
            }
            else {
                await dm_channel.send('There was an error registering your Replika. Please try again.');
                return -1;
            }
        }
        else {
            await qinter.reply('Registration canceled.');
            return 0;
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers a new Replika.'),

    async execute(interaction) {
        const guild_id = interaction.guild.id;
        const channel_id = interaction.channel.id;

        if (registering.has(guild_id)) {
            await interaction.reply('Registration already in progress for this server.');
            return;
        }
        if (channels[channel_id]) {
            await interaction.reply('Channel is in use by another Replika. Please disconnect it first.');
            return;
        }
        registering.add(guild_id);

        const res = await prompt_login(interaction);
        if (res == -1) {
            await interaction.editReply('Registration failed.');
        }
        else if (res == 0) {
            await interaction.editReply('Registration canceled');
        }
        else {
            await interaction.editReply('Registration successful! You can now activate your Replika with the `/connect` command.');
        }
        registering.delete(guild_id);
    },
};
