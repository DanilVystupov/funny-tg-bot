const BotService = require('./services/bot/BotService');
const { pgPool } = require('./database/db');

const botService = new BotService();

botService.injectDependencies({ pgPool });

botService.start();

module.exports = botService;