const axios = require("axios");

const { MONKEY_SEARCH_THEMES, FUNNY_DESCRIPTIONS } = require("../utils/constants");
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
        limit: 100,
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
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt: `[INST]Только строго в этом формате:
Сегодня ты: **Бибизян-тип** — описание эмодзи
Где: 
- тип=1 русское слово
- описание=6-8 русских слов
- 1 эмодзи в конце
Пример: "Сегодня ты: **Бибизян-соня** — уже пятый раз пересматриваешь эту гифку 💤"
Для гифки: ${gifUrl}[/INST]`,
      stream: false,
      options: {
        temperature: 0.9,
        max_tokens: 150,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        stop: ['\n']
      }
    });

    let result = response.data.response.trim();

    if (!result.startsWith('Сегодня ты:')) {
      throw new Error(`Формат нарушен: ${result}`);
    }

    return result;
  } catch (error) {
    console.error('Ошибка:', error.message);
    return randomizer(FUNNY_DESCRIPTIONS);
  }
}

module.exports = {
  getRandomMonkeyGif
}