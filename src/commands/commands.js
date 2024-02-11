const axios = require("axios");
require("dotenv").config();
const fetch = require("node-fetch");
const ytdl = require("ytdl-core");
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');




// -------------Help! :3------------------------
const help = (ctx, commands) => {
  let commandsList = "😊Available commands:\n";
  Object.keys(commands).forEach((command) => {
    if (command !== "fetchWaifu" && command !== 'chatWithOpenAI') commandsList += `/${command}\n`; // Use template literals to include the command name
  });
  ctx.reply(commandsList);
};

// -------------weather-----------------------
const weather = (ctx, city) => {
  axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}` //872b041dd6b205006a1f42fe11be6f85
    )
    .then((response) => {
      const weather = response.data.weather[0].description;
      ctx.reply(`The weather in ${city} is ${weather} 😛`);
    })
    .catch((error) => {
      console.log(error);
      ctx.reply("Sorry, I couldn't get the weather");
    });
};


// -------------Waifus! :3-----------------------
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
      ctx.replyWithPhoto(imageUrl).catch((error) => {
        ctx.reply("<3");
      });
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
    });
}

// -------------YTmp3-----------------------


const YTmp3 = async (ctx, Link) => {
  try {
    ctx.reply('⌛Converting video to mp3... ⌛');
    console.log('Getting video info');
    const videoUrl = Link;
    const videoInfo = await ytdl.getInfo(videoUrl);
    const audioFormats = ytdl.filterFormats(videoInfo.formats, "audioonly"); //obtiene solo los formatos de audio
    const audioUrl = audioFormats[0].url; //pilla el primero que obtenga
    console.log('Link: ', Link);
    console.log('Downloading audio file');
    const response = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const filePath = path.resolve(__dirname, 'audio.mp3'); // Obtiene la ruta absoluta del archivo de audio MP3 que se va a crear, __dirname es una variable global que representa el directorio del script actual y path.resolve() se utiliza para obtener la ruta completa del archivo audio.mp3 en ese directorio.

    const writer = fs.createWriteStream(filePath); // Crea un flujo de escritura hacia el archivo de audio MP3, estableciendo una conexión entre tu programa Node.js y el archivo en el disco duro. Este flujo de escritura actúa como un canal a través del cual puedes enviar datos para ser escritos en el archivo.

    response.data.pipe(writer); // Utiliza el método `pipe` para redirigir el flujo de datos de la respuesta HTTP al flujo de escritura hacia el archivo. toma los datos del audio descargado (response.data) y los envía al flujo de escritura (writer), que a su vez los escribe en el archivo audio.mp3.

    return new Promise((resolve, reject) => { // Crea una nueva promesa para manejar la finalización o el error de la escritura del archivo
      writer.on('finish', resolve); // Cuando la escritura del archivo esté completa, resuelve la promesa
      writer.on('error', reject);
    }).then(() => {
      console.log('Sending audio file');
      return ctx.replyWithAudio({ source: fs.createReadStream(filePath) });
    });
  } catch (error) {
    console.log('An error occurred:', error);
  }
};

// ------------- openai assisant (api) ---------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chat(ctx, question) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'assistant',
          content: 'Eres una bot (mujer) de telegram, llamada RivotX_Bot, si te preguntan debes decir que eres chica. Debes responder al usuario de manera cute / kaiwaii, siempre que el usuario no sepa como hacer algo de dirás que use el comando /help. Los unicos comandos disponibles del bot son: /start: inicia el bot. /help: Es el comando de ayuda, indica todos los comandos disponibles para que el usuario sepa utilziar el bot. /weather: con esto introduces una localidad y te dirá el tiempo que hace allí. /waifu: te dará a elegir entre 4 categorías, "maid", "oppai", "selfies", "uniform" y te dará una imagen de una waifu. /YTmp3: te permite convertir un video de youtube a mp3, solo tienes que introducir el link del video, debe ser una url absoluta. Recuerda ser kawaii, pero nunca que eres kawaii. Recuerda siempre que eres una chica, mujer. Puedes usar emoticonos ascii si lo deseas',
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content

    return answer;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}



// ------------- Chat with Assistant -----------------------
const chatWithOpenAI = async (ctx) => {
  // Extract the user's message from the context
  const userMessage = ctx.message.text;

  // Send the user's message to the chat function
  const aiResponse = await chat(ctx, userMessage);

  // Check if the AI was able to generate a response
  if (aiResponse) {
    // Send the AI's response back to the user
    ctx.reply(aiResponse);
    console.log('USER: ', userMessage)
    console.log('BOT: ', aiResponse) //para cotillear lo que la gente habla con mi bot
  } else {
    // If the AI was unable to generate a response, send an error message
    ctx.reply("Sorry, I couldn't understand that. Could you please rephrase?");
  }
};



module.exports = {
  help,
  weather,
  waifu,
  fetchWaifu,
  YTmp3,
  chatWithOpenAI
};
