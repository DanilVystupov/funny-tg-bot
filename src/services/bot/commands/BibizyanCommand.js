const { getRandomMonkeyGif } = require('../../gifService');
const BaseCommand = require('./BaseCommand');
class BibizyanCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }

  execute() {
    this.bot.onText(/\/bibizyan/, async (msg) => {
      const chatid = msg.chat.id;
      const username = msg.from.username;
      this.bot.sendMessage(chatid, 'Определяю кто ты сегодня...');
      const descriptions = await this.descriptionsService.getDescriptions();
      try {
        const { url, description } = await getRandomMonkeyGif(descriptions);
        await this.bot.sendAnimation(chatid, url, { caption: description });
      } catch (error) {
        console.error(`Ошибка отправки мема для ${username} (${chatid}):`, error.stack);
        this.bot.sendMessage(chatid, 'Упс... что-то пошло не так. Попробуй еще раз /bibizyan');
      }
    })
  }
}

module.exports = BibizyanCommand