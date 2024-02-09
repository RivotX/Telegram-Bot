//comandos
const axios = require("axios");
require("dotenv").config();
const fetch = require("node-fetch");

const looser = (ctx) => {
  ctx.reply("El de tu derecha XDXDXD");
};

const help = (ctx, commands) => {
  let commandsList = "Available commands:\n";
  Object.keys(commands).forEach((command) => {
    if (command !=="fetchWaifu")
    commandsList += `/${command}\n`; // Use template literals to include the command name
  });
  ctx.reply(commandsList);
};

const weather = (ctx) => {
  // get the weather from free weather api
  axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?q=Quito&appid=${process.env.WEATHER_API_KEY}` //872b041dd6b205006a1f42fe11be6f85
    )
    .then((response) => {
      const weather = response.data.weather[0].description;
      ctx.reply(`The weather in Quito is ${weather}`);
    })
    .catch((error) => {
      console.log(error);
      ctx.reply("Sorry, I couldn't get the weather");
    });
};

const waifu = (ctx) => {
  ctx.reply("Select a category! >.<", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Maid", callback_data: "maid" },
          { text: "Oppai", callback_data: "oppai" },
        ],
        [
          { text: "Selfies", callback_data: "selfies" },
          { text: "Uniform", callback_data: "uniform" },
        ],
      ],
    },
  });
};

function fetchWaifu(category, ctx) {
  const apiUrl = "https://api.waifu.im/search";
  const params = {
    included_tags: category,
    height: ">=2000",
    is_nsfw: "false",
  };

  const queryParams = new URLSearchParams(params);
  const requestUrl = `${apiUrl}?${queryParams}`;

  fetch(requestUrl)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Request failed with status code: " + response.status);
      }
    })
    .then((data) => {
      const imageUrl = data.images[0].url;
      ctx.replyWithPhoto(imageUrl);
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
    });
}

module.exports = {
  help,
  looser,
  weather,
  waifu,
  fetchWaifu,
};
