require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const { TIME_SEND_MEME } = require('../../utils/constants');

const StartCommand = require('./commands/StartCommand');
const StopCommand = require('./commands/StopCommand');
const PredictionCommand = require('./commands/PredictionCommand');
const BibizyanCommand = require('./commands/BibizyanCommand');
const WeatherCommand = require('./commands/WeatherCommand');
const FollowersService = require('./FollowersService');
const PredictionsService = require('./PredictionsService');
const MailingCommand = require('./commands/MailingCommand');

class BotService {
  constructor({ pgPool }) {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
    this.userData = {};
    this.pgPool = pgPool;

    this.followersService = new FollowersService(this.pgPool, this.bot);
    this.predictionsService = new PredictionsService(this.pgPool, this.bot);
  }

  setupErrorHandling() {
    this.bot.on('polling_error', (msg) => console.log('polling_error: ', msg));
  }

  registerCommand(CommandClass) {
    new CommandClass(this).execute();
  }

  registerCommands() {
    this.registerCommand(StartCommand);
    this.registerCommand(StopCommand);
    this.registerCommand(PredictionCommand);
    this.registerCommand(BibizyanCommand);
    this.registerCommand(WeatherCommand);
    this.registerCommand(MailingCommand);
  }

  async setupDailyBibizyanMessages() {
    console.log('Вход в setupDailyBibizyanMessages');
    cron.schedule('0 12 * * *', async () => {
      console.log(`setupDailyBibizyanMessages начинает выполнение в ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (Europe/Moscow)`);
      try {
        await this.followersService.sendDailyBibizyan();
      } catch (error) {
        console.error(`Ошибка при установке отправления бибизян в ${TIME_SEND_MEME}: `, error.message);
      }
    }, {
      timezone: 'Europe/Moscow'
    });
    console.log('Выход из setupDailyBibizyanMessages');
  }

  async start() {
    await this.setupDailyBibizyanMessages();
    this.setupErrorHandling();
    this.registerCommands();
  }
}

module.exports = BotService