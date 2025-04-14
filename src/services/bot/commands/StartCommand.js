const BaseCommand = require('./BaseCommand');
class StartCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
      const hasFollower = this.followersService.hasFollower(chatId);

      try {
        if (!hasFollower) {
          await this.followersService.addFollower(chatId, username);
        }
        
        await this.bot.sendMessage(
          chatId,
          `Шалом, поговаривают, что в будущем я смогу стать ботом маминой подруги!
          
/start - запустить/перазапустить бота
/stop - остановить бота (оно вам не надо)))
/prediction - получить самое точное предсказание`
        );
      } catch (error) {
        console.error('Ошибка при добавлении в followers: ', error);
        throw error;
      }
    });
  }
}

module.exports = StartCommand