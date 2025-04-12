const { db } = require("../database/db");

function loadFollowers() {
  const rows = db.prepare('SELECT * FROM followers').all();
  return new Set(rows.map((row) => row));
}

module.exports = {
  loadFollowers
}