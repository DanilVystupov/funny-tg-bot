const { db } = require("../database/db");
const { followersArray, followers } = require("../store/followersStore");
const { updateFollowers } = require("./updateDate");

function createMailingService(botInstance) {
  return {
    sendMessageForAllUsers: (message) => {
      updateFollowers();
      
      for (const follower of followersArray) {
        const chatId = follower.chatId;
        try {
          botInstance.sendMessage(chatId, message);
        } catch (error) {
          console.error(`Ошибка отправки для ${chatId}:`, error.message);
          if (error.response?.body?.error_code === 403) {
            db.prepare('DELETE FROM followers WHERE chatId = ?').run(chatId);
            followers.delete(chatId);
          }
        }
      }
    }
  }
};

module.exports = createMailingService