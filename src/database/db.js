const Database = require('better-sqlite3');
const db = new Database('bot.db');

const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = { db, pgPool };

const followersTable = require('./tables/followersTable');
followersTable.init(db);

const predictionsTable = require('./tables/predictionsTable');
predictionsTable.init(db);

const lastSentDayMailingTable = require('./tables/lastSentDayMailingTable');
lastSentDayMailingTable.init(db);