const BaseCommand = require('./BaseCommand');

class StopCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/stop/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        await this.followersService.removeFollower(chatId);
        await this.bot.sendMessage(chatId, `Отписка завершена 😢`);
      } catch (error) {
        console.error('Ошибка при удалении из followers: ', error);
        throw error; 
      }
    });
  }
}

module.exports = StopCommand