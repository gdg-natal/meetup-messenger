const admin = require('firebase-admin');
const serviceAccount = require('../../config/firebase.json');
const botConfig = require('../../config/bot.json');

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: botConfig.firebaseUrl,
});

const db = app.database();

async function read(ref) {
    const snapshot = await db.ref(ref).once('value');

    return snapshot.val();
}

module.exports = {
    read,
};
