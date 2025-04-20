require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const StartCommand = require('./commands/StartCommand');
const StopCommand = require('./commands/StopCommand');
const PredictionCommand = require('./commands/PredictionCommand');
const BibizyanCommand = require('./commands/BibizyanCommand');
const WeatherCommand = require('./commands/WeatherCommand');
const FollowersService = require('./FollowersService');
const PredictionsService = require('./PredictionsService');

const { TIME_SEND_MEME } = require('../../utils/constants');

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
  }

  async setupDailyBibizyanMessages() {
    cron.schedule('0 12 * * *', async () => {
      try {
        await this.followersService.sendDailyBibizyan();
      } catch (error) {
        console.error(`Ошибка при установке отправки бибизян в ${TIME_SEND_MEME}: `, error.message);
      }
    })
  }

  async start() {
    await this.setupDailyBibizyanMessages();
    this.setupErrorHandling();
    this.registerCommands();
  }
}

module.exports = BotService