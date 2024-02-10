require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");
const commands = require("./commands/commands");


const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "Hi, I'm RivotX'bot, try /help to see the available commands!",
    Markup.keyboard([["/help", "/weather"], ["/waifu"]])
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
  ctx.reply("Select a place to get the weather🤖").then(() => {
    bot.hears(/.*/, (ctx) => {
      commands.weather(ctx, ctx.message.text);
    });
  });
});

bot.command("waifu", (ctx) => {
  commands.waifu(ctx);
});

bot.action(["maid", "oppai", "selfies", "uniform"], (ctx) => {
  const selectedCategory = ctx.callbackQuery.data;
  commands.fetchWaifu(selectedCategory, ctx);
});


bot.command("YTmp3", (ctx) => {
  ctx.reply("Send the YouTube link to convert the video to MP3 (absolute url").then(() => {
    bot.hears(/.*/, (ctx) => {
      commands.YTmp3(ctx, ctx.message.text);
    });
  });
});



bot.launch()
console.log("Bot is running")