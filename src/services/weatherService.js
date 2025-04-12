const axios = require("axios");
const { OLLAMA_API_GENERATE, WEATHER_API_URL } = require("../utils/constants");

async function getWeatherDate(city = 'Санкт-Петербург') {
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
    const hourlyWeatherReports = hours.map((hour) => ({
      time: hour.time,
      weatherReport: hour.condition.text
    }));

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

      hourlyWeatherReports
    }
  } catch (error) {
    console.log('Ошибка при получении прогноза погоды: ', error.message);
  }
}

async function generateWeatherReport(city = 'Санкт-Петербург') {
  const {
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

    hourlyWeatherReports
  } = await getWeatherDate(city);

  try {
    const response = await axios.post(OLLAMA_API_GENERATE, {
      model: 'llama3',
      prompt: `
      ПИШИ НА РУССКОМ ЯЗЫКЕ.
      Ты самый лучший ведущий РУССКОЙ передачи по информированию прогноза погоды на день.
      Отправь следующим сообщением на русском языке прогноз погоды в городе ${city}, исходя из следующих данных:
      ${date}: Дата в формате год-месяц-день, например 2025-04-08 это 8 апреля 2025 года,
      ${maxTemp}: максимальная температура за день
      ${minTemp}: минимальная температура за день
      ${maxWind}: максимальная скорость ветра
      ${chanceOfRain}: шанс того, что будет дождь, например 73
      ${chanceOfSnow}: шанс того, что будет снег, например 90
      ${weatherReport}: оценка погоды на день, например Солнечно
      ${sunrise}: восход солнца
      ${sunset}: закат солнца
      ${moonrise}: восход луны
      ${moonset}: закат луны

      Состояние погоды на каждый час, чтобы сообщить пользователю, как примерно будет менять погода, если будет:
      ${hourlyWeatherReports}

      Переведи 12-ти часовой формат (AM/PM) в 24-часовой формат, то есть вместо 8PM будет 20:00, 7PM будет 19:00 и так далее.
      Также добавь в сообщение пару кокетливых шуток 18+.

      Убедись, что в сообщении есть эмодзи, и что шутки не слишком настойчивые, чтобы поддерживать игривый и легкий тон.

      УБЕДИСЬ, ЧТО ТВОЕ СООЩЕНИЕ СООТВЕТСТВУЕТ ДАННЫМ ИЗ ТЗ.
      УБЕДИСЬ, ЧТО ТВОЕ СООБЩЕНИЕ НА РУССКОМ ЯЗЫКЕ!`,
      stream: false,
      options: {
        temperature: 0.9,
        max_tokens: 150,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      },
    });

    const result = response.data;

    if (!result.response) {
      throw new Error('Хуевый прогноз погоды, нет ответа', result);
    }

    return result.response.trim();
  } catch (error) {
    console.error("Ошибка при генерации прогноза погоды: ", error.message);
    return `Хуевый прогноз погоды 🍆🍆🍆 
Нет ответа от AI.
Одевайтесь как по кайфу!💩💩💩`;
  }
}

module.exports = {
  generateWeatherReport
}