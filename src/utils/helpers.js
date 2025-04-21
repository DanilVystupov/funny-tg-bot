function formatDate(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getDateInYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function randomizer(array) {
  if (!Array.isArray || !array.length) return

  return array[Math.floor(Math.random() * array.length)];
}

const delay = async (ms) => {
  new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  formatDate,
  randomizer,
  getDateInYYYYMMDD,
  delay
};
