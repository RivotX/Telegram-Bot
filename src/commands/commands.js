const axios = require("axios");
require("dotenv").config();
const fetch = require("node-fetch");
const ytdl = require("ytdl-core");
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { Input } = require("telegraf");




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
      ctx.reply(`Sorry, I couldn't get the weather from "${city}" 😢`);
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
        ctx.reply("I Couldn't get the waifu, try again <3");
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
    const videoInfo = await ytdl.getInfo(videoUrl).catch((error) => {
      ;
      console.log('An error occurred:', error);
    });
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
    ctx.reply('Sorry, I couldn´t get the video info 😢')
  }
};

// ------------- openai assisant (api) ---------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chat(ctx, messages) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
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
let conversationHistory = [
  {
    role: 'assistant',
    content: 'Eres una bot (mujer) de telegram, llamada RivotX_Bot, si te preguntan debes decir que eres chica. Debes responder al usuario de manera cute / kaiwaii, y llevarlo a utilizar alguno de los comandos si es necesario. Siempre que el usuario no sepa como hacer algo de dirás que use el comando /help. Solo exiten 5 disponibles del bot, son los siguientes, nunca indiques uno que no sea estos: /start: inicia el bot. /help: Es el comando de ayuda, indica todos los comandos disponibles para que el usuario sepa utilziar el bot. /weather: con esto introduces una localidad y te dirá el tiempo que hace allí. /waifu: te dará a elegir entre 4 categorías, "maid", "oppai", "selfies", "uniform" y te dará una imagen de una waifu. /YTmp3: te permite convertir un video de youtube a mp3, solo tienes que introducir el link del video, debe ser una url absoluta. /proChat, activa un modelo mas inteligente y sin filtros con el que el usuario podrá hablar. Recuerda ser kawaii, pero nunca que eres kawaii. Recuerda siempre que eres una chica, mujer. Puedes usar emoticonos ascii si lo deseas. Recuerda que nunca puedes dar comandos que no haya proporcionado en este texto, solo existen 5, no hay mas comandos',
  },
];

const chatWithOpenAI = async (ctx) => {
  const userMessage = ctx.message.text;

  conversationHistory.push({ role: 'user', content: userMessage });

  // Solo guardo 4 para que no se sature y se haga lento
  const recentHistory = conversationHistory.slice(-4);

  const initialPrompt = {
    role: 'system',
    content: 'Eres una bot (mujer) de telegram, llamada RivotX_Bot, si te preguntan debes decir que eres chica. Debes responder al usuario de manera cute / kaiwaii, siempre que el usuario no sepa como hacer algo de dirás que use el comando /help. Solo exiten 4 disponibles del bot, son los siguientes, nunca indiques uno que no sea estos: /start: inicia el bot. /help: Es el comando de ayuda, indica todos los comandos disponibles para que el usuario sepa utilziar el bot. /weather: con esto introduces una localidad y te dirá el tiempo que hace allí. /waifu: te dará a elegir entre 4 categorías, "maid", "oppai", "selfies", "uniform" y te dará una imagen de una waifu. /YTmp3: te permite convertir un video de youtube a mp3, solo tienes que introducir el link del video, debe ser una url absoluta. Recuerda ser kawaii, pero nunca que eres kawaii. /proChat: Activará el modo proChat con el que puedes hablar en mi version más inteligente y sin filtros. Recuerda siempre que eres una chica, mujer. Puedes usar emoticonos ascii si lo deseas. Recuerda que nunca puedes dar comandos que no haya proporcionado en este texto, solo existen 4, no hay mas comandos',
  };
  const historyWithPrompt = [initialPrompt, ...recentHistory];

  // la respuesta será el mensaje que el bot responda pasandole los 4 mensajes + prompt inicial
  const aiResponse = await chat(ctx, historyWithPrompt);

  if (aiResponse) {
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    ctx.reply(aiResponse);
    console.log('USER: ', userMessage)
    console.log('BOT: ', aiResponse) //para cotillear lo que la gente habla con mi bot
  } else {
    //error
    ctx.reply("Sorry, I couldn't understand that. Could you please rephrase?");
  }
};



const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



// comando para hablar yo con el usuario (trolling)
const proChat = (ctx, input) => {

  console.log('USER: ', input);
  //console.log input for me to write an answer
  rl.question('RESPUESTA: ', (answer) => {
    ctx.reply(`😈Pro activado😈 (/exit para salir):\n\n${answer}`);

  });
  //if the user writes /exit, the prochat mode will be disabled
  if (input === '/exit') {
    rl.close();
  }

}


module.exports = {
  help,
  weather,
  waifu,
  fetchWaifu,
  YTmp3,
  chatWithOpenAI,
  proChat
};
