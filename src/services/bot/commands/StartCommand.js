const { TIME_SEND_MEME, TIME_SEND_WEATHER_REPORT } = require('../../../utils/constants');
const BaseCommand = require('./BaseCommand');

class StartCommand extends BaseCommand {
  constructor(botService) {
    super(botService);
  }
  
  execute() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
    
      this.db.prepare(`
        INSERT OR IGNORE INTO followers (chatId, username) 
        VALUES (?, ?)
      `).run(chatId, username);
    
      this.followers.add(chatId);
    
      await this.bot.sendMessage(
        chatId,
        `Шалом, поговаривают, что в будущем я смогу стать ботом маминой подруги!

Ежедневная рассылка 🐒обезьянок🐒 в ${TIME_SEND_MEME}!
Ежедневная рассылка ☁️прогноза погоды☁️ в ${TIME_SEND_WEATHER_REPORT}!

/start - запустить/перазапустить бота
/stop - остановить бота (оно вам не надо)))
/prediction - получить самое точное предсказание`
      );
    });
  }
}

module.exports = StartCommand