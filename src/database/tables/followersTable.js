module.exports = {
  init: function(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS followers (
        chatId INTEGER PRIMARY KEY,
        username TEXT,
        subscribedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    try {
      db.exec(`
        ALTER TABLE followers ADD COLUMN isSentWeatherReport BOOLEAN DEFAULT false
      `);
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw new Error('Произошла ошибка при добавлении колонки isSentWeatherReport: ', error);
      }
    }
    
    try {
      db.exec(`
        ALTER TABLE followers ADD COLUMN isSentMeme BOOLEAN DEFAULT false
      `)
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw new Error('Произошла ошибка при добавлении колонки isSentMeme: ', error);
      }
    }
    
    try {
      db.exec(`
        ALTER TABLE followers ADD COLUMN lastSentDayMailing TEXT
      `);
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw new Error('Произошла ошибка при добавлении колонки lastSentDayMailing: ', error);
      }
    }
  }
};