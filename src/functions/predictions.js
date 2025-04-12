const { db } = require("../database/db");
const { BAD_PREDICTIONS } = require("../utils/constants");

function loadPredictions() {
  BAD_PREDICTIONS.forEach((prediction) => {
    db.prepare(`
      INSERT OR IGNORE INTO predictions (prediction)
      VALUES (?)
    `).run(prediction);
  });

  const predictions = db.prepare('SELECT prediction FROM predictions').all();
  return new Set(predictions.map((item) => item.prediction));
}

module.exports = {
  loadPredictions
}