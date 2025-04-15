const BaseCommand = require('./BaseCommand');
class StartCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = String(msg.chat.id);
      const username = msg.from.username;
      const hasFollower = this.followersService.hasFollower(chatId);

      try {
        if (!hasFollower) {
          await this.followersService.addFollower(chatId, username);
        }
        
        await this.bot.sendMessage(
          chatId,
          `Шалом, поговаривают, что в будущем я смогу стать ботом маминой подруги!
          
/start - запустить бота
/stop - остановить бота
/bibizyan - узнать какой ты сегодня бибизян
/prediction - получить самое точное предсказание
/weather - получить прогноз погоды`
        );
      } catch (error) {
        console.error('Ошибка при добавлении в followers: ', error);
        throw error;
      }
    });
  }
}

module.exports = StartCommand