require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const commands = require('./commands');

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text.toString().toLowerCase() === '/start') {
        bot.sendMessage(chatId, "Hello, I'm your bot!");
    }
});

Object.keys(commands).forEach((command) => {
    bot.onText(new RegExp(`/${command}`), (msg) => {
        commands[command](bot, msg);
    });
});