require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");

const commands = require("./commands/comandos");

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
  commands.weather(ctx);
});

bot.command("waifu", (ctx) => {
  commands.waifu(ctx);
});

bot.action(["maid", "oppai", "selfies", "uniform"], (ctx) => {
  const selectedCategory = ctx.callbackQuery.data;
  commands.fetchWaifu(selectedCategory, ctx);
});

bot.launch();