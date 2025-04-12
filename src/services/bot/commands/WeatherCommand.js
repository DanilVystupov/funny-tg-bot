const { STATES } = require('../../../utils/constants');
const { generateWeatherReport } = require('../../weatherService');
const BaseCommand = require('./BaseCommand');

class WeatherCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
    this.STATE = STATES.WAITING_WEATHER_CITY;
  }

  execute() {
    this.bot.onText(/\/weather/, async (msg) => {
      const chatId = msg.chat.id;
      this.userData[chatId] = { state: this.STATE };
      await this.bot.sendMessage(
        chatId,
        `Для какого города интересует прогноз?
(или /cancel) для отмены`
      )
    });

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      
      if (this.userData[chatId]?.state === this.STATE) {
        const city = msg.text;
        
        if (city === '/cancel') {
          delete this.userData[chatId];
          return this.bot.sendMessage(chatId, 'Отмена успешно выполнена');
        }
        
        this.bot.sendMessage(chatId, `Состаляю прогноз для города ${city}...`);
        const weatherReport = await generateWeatherReport(city);
        delete this.userData[chatId];
        await this.bot.sendMessage(chatId, weatherReport);
      }
    })
  }
}

module.exports = WeatherCommand