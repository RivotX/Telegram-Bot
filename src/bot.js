require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");
const commands = require("./commands/commands");
const LocalSession = require('telegraf-session-local');
const localSession = new LocalSession({ database: 'session_db.json' });

const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);
bot.use(localSession.middleware());


bot.start((ctx) => {
  ctx.reply(
    "💗Hi, I'm RivotX'bot, im here to assist you!.\nYou can chat with me\nOr try /help to see the aviable commands 💗",
    Markup.keyboard([["/help", "/weather"], ["/waifu", "/YTmp3"]])
      .oneTime() //una vez que se usa la primera vez, desaparece
      .resize() //para que se ajuste al tamaño del teclado
  );
});

bot.help((ctx) => {
  commands.help(ctx, commands);
});

bot.command("looser", (ctx) => {
  commands.looser(ctx);
});


bot.command("weather", (ctx) => {
  ctx.reply("Select a place to get the weather🤖")
  ctx.session.awaitingWeather = true;
});


bot.command("waifu", (ctx) => {
  commands.waifu(ctx);
});

bot.action(["maid", "oppai", "selfies", "uniform"], (ctx) => {
  const selectedCategory = ctx.callbackQuery.data;
  commands.fetchWaifu(selectedCategory, ctx);
});


bot.command("YTmp3", (ctx) => {
  ctx.reply("Send the YouTube link to convert the video to MP3 \nit must be an ABSOLUTE url (https://www.)");
  ctx.session.awaitingYTmp3 = true;
});

// Si está esperando a que el usuario pase informacion para un comando, se ejecuta el comando en vez de openai
bot.on('message', (ctx) => {
  if (ctx.session.awaitingYTmp3) {
    commands.YTmp3(ctx, ctx.message.text);
    ctx.session.awaitingYTmp3 = false;
  } else if (ctx.session.awaitingWeather) {
    commands.weather(ctx, ctx.message.text);
    ctx.session.awaitingWeather = false;
  }
  else {
    commands.chatWithOpenAI(ctx);
  }
});

bot.on('message', commands.chatWithOpenAI);

bot.launch()
console.log("Bot is running")