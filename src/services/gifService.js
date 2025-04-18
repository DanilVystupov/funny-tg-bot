const axios = require("axios");

const { 
  MONKEY_SEARCH_THEMES, 
  FUNNY_DESCRIPTIONS, 
  TOGETHER_API_URL, 
} = require("../utils/constants");
const { randomizer } = require("../utils/helpers");

async function getRandomMonkeyGif() {
  try {
    const url = await getRandomGifUrl();
    const description = await generateGifDescription();

    return {
      url,
      description
    };
  } catch (error) {
    console.error('Ошибка при получении гифки:', error);
    return {
      url: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHExNHY2OGdub2hxbXAyM3VlZjE0cDhydXBoOGZzaW8ydnN3cDFzcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MbAKIY1bYnNoo27eWf/giphy.gif',
      description: 'Эммм... Что-то пошло не так :('
    };
  }
}

async function getRandomGifUrl() {
  try {
    const response = await axios.get('https://tenor.googleapis.com/v2/search', {
      params: {
        key: process.env.TENOR_API_KEY,
        q: randomizer(MONKEY_SEARCH_THEMES),
        limit: 50,
        media_filter: 'minimal'
      },
      timeout: 5000
    });

    const gifs = response.data.results.map(gif => ({
      url: gif.media_formats.gif.url
    }));

    if (!gifs.length) {
      throw new Error('Не найдено подходящих GIFs: ', gifs)
    }

    const result = randomizer(gifs);

    return result.url
  } catch (error) {
    console.error('Ошибка при получении URL гифки:', error);
    return 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHExNHY2OGdub2hxbXAyM3VlZjE0cDhydXBoOGZzaW8ydnN3cDFzcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MbAKIY1bYnNoo27eWf/giphy.gif'
  }
}

async function generateGifDescription(gifUrl) {
  try {
    const strictPrompt = `
      ОТВЕТЬ ОДНИМ СООБЩЕНИЕМ БЕЗ РАССУЖДЕНИЙ.
      Придумай смешное название для описания меменой/смешной гифки по url: ${gifUrl}.

      В следющем формате:
      Сегодня ты: **Бибизян-тип** — описание эмодзи
        Где: 
        - тип=1 русское слово
        - описание=6-8 русских слов
        - 1 эмодзи в конце

      Примеры:
      "Сегодня ты: **Бибизян-соня** — уже пятый раз пересматриваешь эту гифку 💤",
      "Сегодня ты: **Бубнезный бибизян** — несешь чушь, но звучит эпично 🎤", 
      "Сегодня ты: **Бибизян-зумер** — работаешь 5 минут, устал на 5 часов 📱"

      ПРИМЕРЫ НЕ ИСПОЛЬЗУЙ В ФИНАЛЬНОМ ОТВЕТЕ.

      Темы могут быть абсолютно разными:
        - Состояния усталости
        - Работа/учеба
        - Эмоции/настроение
        - Ситуативные
        - Абсурдные
        - Интернет/мемы
        - Бытовуха
      ОТВЕТЬ ОДНИМ СООБЩЕНИЕМ БЕЗ РАССУЖДЕНИЙ.
    `

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages: [{ role: "user", content: strictPrompt }],
        temperature: 0.9,
        max_tokens: 800
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );


    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Неверный формат ответа от API');
    }

    const result = response.data.choices[0].message.content
      .replace(/<think>.*<\/think>/gs, '')
      .replace(/^[^а-яА-Я]*/, '')
      .trim();

    if (!result.includes('Сегодня ты:')) {
      throw new Error(`Формат нарушен: ${result}`);
    }

    return result;
  } catch (error) {
    console.error('Ошибка при генерации описания для гифки с бибизяном:', error.message);
    return randomizer(FUNNY_DESCRIPTIONS);
  }
}

module.exports = {
  getRandomMonkeyGif
}