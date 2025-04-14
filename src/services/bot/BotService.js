require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const StartCommand = require('./commands/StartCommand');
const StopCommand = require('./commands/StopCommand');
const PredictionCommand = require('./commands/PredictionCommand');
const BibizyanCommand = require('./commands/BibizyanCommand');
const WeatherCommand = require('./commands/WeatherCommand');
const FollowersService = require('./FollowersService');
const PredictionsService = require('./PredictionsService');

class BotService {
  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN_LOCAL, { polling: true });
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

  async initialize() {
    try {
      await Promise.all([
        this.followersService.loadFollowers(),
        this.predictionsService.loadGoodPredictions(),
        this.predictionsService.loadBadPredictions()
      ]);
    } catch (error) {
      console.error('Ошибка при инициализации бота: ', error.message);
      throw error;
    }
  }

  registerCommand(CommandClass) {
    new CommandClass(this).execute();
  }

  async registerCommands() {
    this.registerCommand(StartCommand);
    this.registerCommand(StopCommand);
    this.registerCommand(PredictionCommand);
    this.registerCommand(BibizyanCommand);
    this.registerCommand(WeatherCommand);
  }

  async start() {
    this.setupErrorHandling();
    await this.initialize();
    await this.registerCommands();
  }
}

module.exports = BotService