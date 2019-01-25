const serializer = require('./src/serializer');
const Group = require('./src/serializer/Group');
const Member = require('./src/serializer/Member');
const MsgQueue = require('./src/helper/Sender');
const EventModel = require('./src/serializer/Event');
const stream = require('./src/helper/stream');
const bot = require('./src/helper/bot');
const botConfig = require('./config/bot.json');
const firebase = require('./src/helper/firebase');


(async () => {
    try {
        const page = await bot.init();

        const msgQueue = new MsgQueue(page, await firebase.read('events'));

        stream((msg) => {
            const group = serializer(msg.group, Group);
            const member = serializer(msg.member, Member);
            const eventData = serializer(msg.event, EventModel);

            if (group.id === botConfig.group.id && msg.response === 'yes') {
                msgQueue.addToQueue(member, eventData);
            }
        });
    } catch (e) {
        console.log(e);
    }
})();
