const axios = require("axios");

const { MONKEY_SEARCH_THEMES, TOGETHER_API_URL } = require("../utils/constants");
const { randomizer } = require("../utils/helpers");

async function getRandomMonkeyGif(descriptions) {
  try {
    const url = await getRandomGifUrl();
    // Проверка доступности URL
    const responseUrl = await axios.head(url, { timeout: 5000 });
    if (responseUrl.status !== 200) {
      throw new Error(`Недопустимый URL: ${url}`);
    }

    // Проверка размера файла
    // Для ботов: Максимальный размер файла (GIF, фото, видео и т.д.) — 50 MB
    const contentLength = responseUrl.headers['content-length'];
    if (contentLength &&  contentLength > 50 * 1024 * 1024) {
      throw new Error(`GIF слишком большой: ${contentLength} байт`);
    }
    
    const responseDescription = await generateGifDescription(url, descriptions);
    // Проверка типа и структуры ответа
    let description
    if (typeof responseDescription === 'string') {
      description = responseDescription;
    } else if (responseDescription && typeof responseDescription === 'object') {
      description = responseDescription?.description || JSON.stringify(responseDescription);
    } else {
      console.log('responseDescription = ', {...responseDescription});
      throw new Error(`Некорректный тип описания: ${typeof responseDescription}`);
    }

    return { url, description };
  } catch (error) {
    console.error('Ошибка при получении гифки:', error.stack);
    return {
      url: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHExNHY2OGdub2hxbXAyM3VlZjE0cDhydXBoOGZzaW8ydnN3cDFzcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MbAKIY1bYnNoo27eWf/giphy.gif',
      description: 'Эммм... Что-то пошло не так :(  Попробуй еще раз /bibizyan'
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

async function generateGifDescription(gifUrl, descriptions) {
  try {
    const strictPrompt = `
      ОТВЕТЬ ОДНИМ СООБЩЕНИЕМ БЕЗ РАССУЖДЕНИЙ.
      Придумай смешное описание меменой/смешной гифки по url: ${gifUrl}.

      В следющем формате:
      Сегодня ты: **Бибизян-тип** — описание эмодзи
        Где: 
        - тип=1 русское слово
        - описание=6-8 русских слов
        - 1 эмодзи в конце

      Примеры:
      "Сегодня ты: **Бибизян-соня** — уже пятый раз пересматриваешь эту гифку 💤",
      "Сегодня ты: **Бубнезный бибизян** — несешь чушь, но звучит эпично 🎤", 
      "Сегодня ты: **Бибизян-зумер** — работаешь 5 минут, устал на 5 часов 📱",
      "Сегодня ты: **Бибизян-ностальгия** — 'раньше бананы были вкуснее...' 🍌🕰️",  
      "Сегодня ты: **Бибизян-сарказм** — 'о, отлично... просто замечательно' 👏",  
      "Сегодня ты: **Бибизян-детокс** — 'сегодня без кринжа... (шутка)' 🧘",  
      "Сегодня ты: **Бибизян-хаос** — 'у меня есть план... НЕТ' 🎭", 

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
      ОТВЕТ МАКСИМУМ 80 СИМВОЛОВ!
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
        },
        timeout: 30000
      }
    );


    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Неверный формат ответа от API');
    }

    const result = response.data.choices[0].message.content
      .replace(/<think>.*<\/think>/gs, '')
      .replace(/^[^а-яА-Я]*/, '')
      .trim();

    const hasEnglishLetters = /[a-zA-Z]/.test(result);

    if (!result.includes('Сегодня ты:') || result.length < 20 || result.length > 80 || hasEnglishLetters) {
      throw new Error(`Формат нарушен: ${result}`);
    }

    return result;
  } catch (error) {
    console.error('Ошибка при генерации описания для гифки с бибизяном:', error.message);
    return randomizer(descriptions);
  }
}

module.exports = {
  getRandomMonkeyGif
}