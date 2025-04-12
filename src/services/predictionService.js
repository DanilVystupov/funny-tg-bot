const { randomizer } = require("../utils/helpers");

function getRandomPrediction(array) {
  return randomizer(array);
}

module.exports = {
  getRandomPrediction
}