const { loadFollowers } = require("../functions/loadFollowers");

let followers = loadFollowers();
let followersArray = Array.from(followers);

module.exports = {
  followers,
  followersArray
}