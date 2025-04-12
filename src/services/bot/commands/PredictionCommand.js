const BaseCommand = require('./BaseCommand');
const { getRandomPrediction } = require('../../predictionService');

class PredictionCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/prediction/, async (msg) => {
      const chatId = msg.chat.id;
      const prediction = getRandomPrediction(this.predictionsStore.predictionsArray);
      
      await this.bot.sendMessage(chatId, prediction);
//       await this.bot.sendMessage(chatId, `Хочешь предложить свое предсказание?
// Отправляй команду /add_prediction`);
    });
  }
}

module.exports = PredictionCommand