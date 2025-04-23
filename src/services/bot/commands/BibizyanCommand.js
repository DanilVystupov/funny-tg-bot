const { getRandomMonkeyGif } = require('../../gifService');
const BaseCommand = require('./BaseCommand');

class BibizyanCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }

  execute() {
    this.bot.onText(/\/bibizyan/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        this.bot.sendMessage(chatId, 'Определяю кто ты сегодня...');
        const descriptions = await this.descriptionsService.getDescriptions();
        const { url, description } = await getRandomMonkeyGif(descriptions);
        await this.bot.sendAnimation(chatId, url, { caption: description });
      } catch (error) {
        console.error(`Ошибка отправки мема для ${chatId}:`, error.message);
        this.bot.sendMessage(chatId, 'Упс... что-то пошло не так. Попробуй еще раз /bibizyan');
      }
    })
  }
}

module.exports = BibizyanCommand