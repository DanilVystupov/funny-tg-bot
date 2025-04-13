const axios = require("axios");
const { TOGETHER_API_URL, WEATHER_API_URL } = require("../utils/constants");

async function getWeatherData(city = 'Санкт-Петербург') {
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        days: 1,
        lang: 'ru',
        key: process.env.WEATHER_API_KEY
      }
    })

    const result = response.data;

    if (!result.forecast.forecastday[0].date) {
      throw new Error('Ошибка, result: ', result);
    }

    const date = result.forecast.forecastday[0].date; // дата прогноза в формате год-месяц-день, например "2025-04-08"

    const forecastDay = result.forecast.forecastday[0].day;
    const maxTemp = Math.round(forecastDay.maxtemp_c); // максимальная температура за день
    const minTemp = Math.round(forecastDay.mintemp_c); // минимальная температура за день
    const maxWind = Math.round(forecastDay.maxwind_kph); // максимальная скорость ветра
    const chanceOfRain = forecastDay.daily_chance_of_rain; // шанс того, что будет дождь, например 73
    const chanceOfSnow = forecastDay.daily_chance_of_snow; // шанс того, что будет снег, например 90
    const weatherReport = forecastDay.condition.text; // оценка погоды на день, например Солнечно

    const astro = result.forecast.forecastday[0].astro;
    const sunrise = astro.sunrise; // восход солнца
    const sunset = astro.sunset; // закат солнца
    const moonrise = astro.moonrise; // восход луны
    const moonset = astro.moonset; // закат луны

    // Состояние погоды на каждый час
    const hours = result.forecast.forecastday[0].hour;
    const hourlyForecast = hours.map(hour => ({
      time: hour.time.split(' ')[1], // Оставляем только время
      temp: Math.round(hour.temp_c),
      condition: hour.condition.text,
      chance_of_rain: hour.chance_of_rain
    }));

    // Ключевые часы
    const keyHours = [6, 9, 12, 15, 18, 21];
    const keyHourlyForecast = hourlyForecast.filter(hour => 
      keyHours.includes(parseInt(hour.time.split(':')[0]))
    );

    return {
      date,
      maxTemp,
      minTemp,
      maxWind,
      chanceOfRain,
      chanceOfSnow,
      weatherReport,
      sunrise,
      sunset,
      moonrise,
      moonset,
      hourlyForecast: keyHourlyForecast
    }
  } catch (error) {
    console.log('Ошибка при получении прогноза погоды: ', error.message);
    return null;
  }
}

async function generateWeatherReport(city = 'Санкт-Петербург') {
  const weatherData = await getWeatherData(city);
  
  if (!weatherData) {
    return "Не удалось получить данные о погоде. Попробуйте позже!";
  }

  try {
    const hourlyForecastText = weatherData.hourlyForecast.map(hour => 
      `⏰ ${hour.time}: ${hour.temp}°C, ${hour.condition}${hour.chance_of_rain > 0 ? ` (🌧 ${hour.chance_of_rain}%)` : ''}`
    ).join('\n');

    const strictPrompt = `
      Составь подробный и весёлый прогноз погоды на ${weatherData.date} для города ${city}. Используй следующие данные:

      🌡 Температура:
      - Максимальная: ${weatherData.maxTemp}°C
      - Минимальная: ${weatherData.minTemp}°C

      🌬 Ветер: до ${weatherData.maxWind} км/ч
      Осадки: ${weatherData.chanceOfRain}% на дождь, ${weatherData.chanceOfSnow}% на снег

      ☀️ Световой день:
      - Восход: ${weatherData.sunrise}
      - Закат: ${weatherData.sunset}

      Почасовой прогноз:
      ${hourlyForecastText}

      Требования:
      1. Начни с общей сводки (температура, осадки, ветер)
      2. Добавь анализ почасовых изменений (когда ожидать потепление/похолодание)
      3. Включи 1-2 шутки про погоду (но без пошлостей)
      4. Добавь рекомендации по одежде
      5. Используй эмодзи для наглядности
      6. Сохраняй дружелюбный и позитивный тон
      7. Длина: 5-7 предложений

      Не пиши "<think>" или другие служебные пометки - только готовый прогноз!
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

    const forecast = response.data.choices[0].message.content
      .replace(/<think>.*<\/think>/gs, '')
      .replace(/^[^а-яА-Я]*/, '')
      .trim();

    return forecast
  } catch (error) {
    console.error("Ошибка генерации прогноза:", error.message);
    return "Погодный робот на перекуре... Попробуйте позже! ☕";
  }
}

module.exports = {
  generateWeatherReport
}