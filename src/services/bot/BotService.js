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

class BotService {
  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
    this.userData = {};
  }

  injectDependencies(dependencies) {
    if (!dependencies.pgPool) throw new Error('Зависимость pgPool обязательна!');
    this.pgPool = dependencies.pgPool;
    
    this.followersService = new FollowersService(this.pgPool);
    this.predictionsService = new PredictionsService(this.pgPool);
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

  async initialize() {
    try {
      await Promise.all([
        this.followersService.loadFollowers(),
        this.predictionsService.loadGoodPredictions(),
        this.predictionsService.loadBadPredictions()
      ])
    } catch (error) {
      console.error('Ошибка при инициализации бота: ', error.message);
      throw error;
    }
  }

  async setupDailyBibizyanMessages() {
    try {
      await this.followersService.sendDailyBibizyan();
    } catch (error) {
      console.error('Ошибка при установке отправки бибизян в 12:00: ', error.message);
    }
  }

  async start() {
    this.setupErrorHandling();
    await this.initialize();
    this.registerCommands();
    cron.schedule('* 12 * * *', this.setupDailyBibizyanMessages)
  }
}

module.exports = BotService