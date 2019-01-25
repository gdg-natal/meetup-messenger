const puppeteer = require('puppeteer');
const botConfig = require('../../config/bot.json');

let browser = null;

function delay(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

async function doActionAtFunctionWithText(page, selector, text, callback) {
    const linkHandlers = await page.$x(`//${selector}[contains(text(), '${text}')]`);

    if (linkHandlers.length > 0) {
        await callback(linkHandlers);

        return linkHandlers;
    }
    return Promise.reject();
}

async function login(page) {
    await page.goto('https://secure.meetup.com/login/');
    await page.click('#button-google');
    await page.waitForNavigation();
    await page.type('#identifierId', botConfig.email);
    await page.click('#identifierNext');
    await page.waitForSelector('[name=password]');
    await delay(1000);
    await page.type('[name=password]', botConfig.password);
    await page.click('#passwordNext');
    await delay(700);

    const condition = await page.$$("input[aria-invalid='true']");

    if (condition.length > 0) {
        return Promise.reject();
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    return delay(1000);
}

async function init() {
    console.log('Initializing Bot...');
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        console.log(`Connecting with user ${botConfig.email}`);
        await login(page);
        console.log('Ready!');
        return page;
    } catch (e) {
        throw new Error('Error while initlizing, check your email and password.');
    }
}

async function sendMessagePrep(page) {
    await page.waitForSelector('#profileNav');
    await page.click('#profileNav');

    try {
        await doActionAtFunctionWithText(page, 'a', botConfig.group.name, async ([link]) => {
            await link.click();
        });
    } catch (e) {
        console.log('Error while choosing the group, please check the name on config');
        return null;
    }

    await page.waitForNavigation();
    await page.waitForSelector('.groupAnchorBar ul.inlineblockList li:nth-child(3) a');

    return page.click('.groupAnchorBar ul.inlineblockList li:nth-child(3) a');
}

async function sendMsg(page, member, message) {
    await sendMessagePrep(page);
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", `${member.id}`);
    await delay(1000);
    await page.keyboard.press('ArrowDown');
    await delay(700);

    if ((await page.$$('ul.ui-autocomplete li.ui-menu-item')).length > 0) {
        await page.waitForSelector('ul.ui-autocomplete li.ui-menu-item:nth-child(1) a');
        await page.click('ul.ui-autocomplete li.ui-menu-item:nth-child(1) a');
        await page.waitForNavigation();

        await delay(700);

        await page.click('.j-composeNewMessage');

        await page.waitForSelector('#messaging-new-convo');
        await page.type('#messaging-new-convo', message);

        await delay(700);

        await page.click('.j-messageSend');

        return page.waitForNavigation();
    }

    return Promise.reject();
}

module.exports = {
    init,
    sendMessagePrep,
    sendMsg,
    delay,
    finish: async () => {
        await browser.close();
    },
};
