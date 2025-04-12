const { loadFollowers } = require("./loadFollowers");
const { followers, followersArray } = require("../store/followersStore");

const { loadPredictions } = require("./predictions");
const { predictions, predictionsArray } = require("../store/predictionsStore");

function updateFollowers() {
  const newFollowers = loadFollowers();
  followers.clear();
  newFollowers.forEach((follower) => followers.add(follower));
  followersArray = Array.from(followers);
}

function updatePredictions() {
  const newPredictions = loadPredictions();
  predictions.clear();
  newPredictions.forEach((prediction) => predictions.add(prediction));
  predictionsArray = Array.from(followers);
}

module.exports = {
  updateFollowers,
  updatePredictions
}