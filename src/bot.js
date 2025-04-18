const BotService = require('./services/bot/BotService');
const { pgPool } = require('./database/db');

const botService = new BotService({ pgPool });

botService.start();

module.exports = botService;