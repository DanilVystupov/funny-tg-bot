const Database = require('better-sqlite3');
const db = new Database('bot.db');

module.exports = { db };

const followersTable = require('./tables/followersTable');
followersTable.init(db);

const predictionsTable = require('./tables/predictionsTable');
predictionsTable.init(db);

const lastSentDayMailingTable = require('./tables/lastSentDayMailingTable');
lastSentDayMailingTable.init(db);