module.exports = {
  init: function(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS predictions (
        prediction TEXT
      )
    `);
  }
};