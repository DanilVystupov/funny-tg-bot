const BaseCommand = require('./BaseCommand');

class StopCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/stop/, async (msg) => {
      const chatId = String(msg.chat.id);
      const hasFollower = await this.followersService.hasFollower(chatId);

      try {
        if (hasFollower) {
          await this.followersService.removeFollower(chatId);
          await this.bot.sendMessage(chatId, 'Отписка завершена 😢');
        } else {
          this.bot.sendMessage(chatId, 'Вы уже отписаны... \nДля возобновления бота /start')
        }
      } catch (error) {
        console.error('Ошибка при удалении из followers: ', error);
      }
    });
  }
}

module.exports = StopCommand