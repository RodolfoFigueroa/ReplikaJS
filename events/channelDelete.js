const { channels } = require('../handlers.js');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        const current = channels[channel.id];
        if (!current) {
            return;
        }
        else {
            await current.disconnect();
        }
    },
};