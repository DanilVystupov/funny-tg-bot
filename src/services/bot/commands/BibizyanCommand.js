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
        const { url, description } = await getRandomMonkeyGif();
        await this.bot.sendAnimation(chatId, url, { caption: description });
      } catch (error) {
        console.error(`Ошибка отправки мема для ${chatId}:`, error.message);
      }
    })
  }
}

module.exports = BibizyanCommand