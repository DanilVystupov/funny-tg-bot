const BaseCommand = require('./BaseCommand');
const { getRandomPrediction } = require('../../predictionService');

class PredictionCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/prediction/, async (msg) => {
      const chatId = msg.chat.id;
      const isGoodPrediction = Math.floor(Math.random() * 2);
      const goodPredictions = await this.predictionsService.getGoodPredictions();
      const badPredictions = await this.predictionsService.getBadPredictions();

      const predictions = isGoodPrediction ? goodPredictions : badPredictions;
      const { prediction } = getRandomPrediction(predictions);

      const header = isGoodPrediction
        ? '✨ *Тебе улыбнулась удача!* ✨\n\nВселенная шепчет:' 
        : '☠️ *Темные тучи на горизонте...* ☠️\n\nОракул предрекает:';

      await this.bot.sendMessage(
        chatId,
        `${header}\n\n_"${prediction}"_`,
        { parse_mode: 'Markdown' }
      );
    });
  }
}

module.exports = PredictionCommand