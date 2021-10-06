const { channels, ReplikaDualInstance } = require('../handlers.js');

const reactions = {
    '👍': 'Upvote',

    '👎': 'Downvote',

    '❤️': 'Love', '💟': 'Love', '❣️': 'Love', '😍': 'Love', '😻': 'Love',
    '💓': 'Love', '💗': 'Love', ';♥️': 'Love', '🖤': 'Love', '💙': 'Love',
    '🤎': 'Love', '💝': 'Love', '💚': 'Love', '😘': 'Love', '🧡': 'Love',
    '💜': 'Love', '💞': 'Love', '🥰': 'Love', '💖': 'Love', '🤍': 'Love',
    '💕': 'Love', '💛': 'Love',

    '😆': 'Funny', '🤣': 'Funny',

    '🤔': 'Meaningless', '😕': 'Meaningless',

    '😠': 'Offensive', '🤢': 'Offensive', '🤮': 'Offensive',
};

module.exports = {
    name: 'messageReactionAdd',
    // eslint-disable-next-line no-unused-vars
    async execute(reaction, user) {
        const channel_id = reaction.message.channel.id;
        const current = channels[channel_id];
        if (!current || current instanceof ReplikaDualInstance) {
            return;
        }
        if (current.last_message.discord == reaction.message.id) {
            const reaction_code = reactions[reaction.emoji];
            if (reaction_code) {
                await current.send_reaction(reaction_code);
            }
        }
    },
};