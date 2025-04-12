const { TIME_SEND_MEME } = require("../utils/constants");
const { followersArray, followers } = require("../store/followersStore");
const { getRandomMonkeyGif } = require("../services/gifService");
const { bot } = require("../index");

async function sendDailyMeme() {
  if (formatDate(new Date()) !== TIME_SEND_MEME) {
    return;
  }

  for (const follower of followersArray) {
    const chatId = follower.chatId;
    try {
      const { url, description } = await getRandomMonkeyGif();
      await bot.sendAnimation(chatId, url, { caption: description });
    } catch (error) {
      console.error(`Ошибка отправки мема для ${chatId}:`, error.message);
      if (error.response?.body?.error_code === 403) {
        db.prepare('DELETE FROM followers WHERE chatId = ?').run(chatId);
        followers.delete(chatId);
      }
    }
  }
};

module.exports = {
  sendDailyMeme
}