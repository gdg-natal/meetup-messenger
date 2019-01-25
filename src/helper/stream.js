const WebSocket = require('websocket').w3cwebsocket;

const url = 'ws://stream.meetup.com/2/rsvps';

module.exports = (reporter) => {
    const client = new WebSocket(url);

    client.onerror = () => {
        console.log('Connection Error');
    };

    client.onclose = () => {
        console.log('echo-protocol Client Closed');
    };

    client.onmessage = (e) => {
        if (typeof e.data === 'string') {
            reporter(JSON.parse(e.data, null, 4));
        }
    };
};
