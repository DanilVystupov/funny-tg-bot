const { loadPredictions } = require("../functions/predictions");

const predictions = loadPredictions();
const predictionsArray = Array.from(predictions);

module.exports = {
  predictions,
  predictionsArray
}