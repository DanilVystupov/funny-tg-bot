module.exports = {
  init: function(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS lastSentDayMailing (
        day TEXT UNIQUE
      )
    `);
  }
};