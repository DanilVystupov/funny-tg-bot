const BotService = require('./services/bot/BotService');
const { db } = require('./database/db');
const { followers } = require('./store/followersStore');
const { predictionsArray } = require('./store/predictionsStore');

const botService = new BotService();

botService.injectDependencies({
  db,
  followers,
  predictionsStore: { predictionsArray }
});

botService.start();

module.exports = botService;