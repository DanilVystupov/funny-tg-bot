const BaseCommand = require('./BaseCommand');

class StopCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/stop/, (msg) => {
      const chatId = msg.chat.id;
    
      this.db.prepare('DELETE FROM followers WHERE chatId = ?').run(chatId);
      this.followers.delete(chatId);
    
      this.bot.sendMessage(chatId, "Отписка завершена 😢");
    });
  }
}

module.exports = StopCommand