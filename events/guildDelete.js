const { channels, guilds } = require('../handlers.js');
const db = require('../database/commands.js');

module.exports = {
    name: 'guildDelete',
    async execute(guild) {
        const active_channels = guilds[guild.id];
        active_channels.forEach(async channel_id => {
            await channels[channel_id].disconnect();
        });
        await db.delete_guild(guild.id);
    },
};