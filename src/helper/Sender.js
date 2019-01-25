const { template } = require('lodash');
const bot = require('./bot');

class Sender {
    constructor(page, messages) {
        this.page = page;
        this.queue = [];
        this.sending = false;
        this.messages = messages;
    }


    async triggerMsg() {
        this.sending = true;
        const { member, event } = this.queue.shift();
        const message = template(this.messages[event.id]);

        await bot.sendMsg(this.page, member, message({ user: member, event }));

        if (this.queue.length > 0) {
            bot.delay(1000);
            this.triggerMsg();
        }

        this.sending = false;
    }

    addToQueue(member, event) {
        this.queue.push({ member, event });

        if (this.queue.length === 1 && !this.sending) {
            this.triggerMsg();
        }
    }
}


module.exports = Sender;
