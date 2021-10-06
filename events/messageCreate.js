const { channels, ReplikaInstance } = require('../handlers.js');
module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const channel_id = message.channel.id;
        const data = channels[channel_id];
        if (!data) {
            return;
        }
        const replika = data.replika;
        if (replika instanceof ReplikaInstance && !message.author.bot) {
            replika.send(message);
            replika.watchdog.refresh();
        }
    },
};