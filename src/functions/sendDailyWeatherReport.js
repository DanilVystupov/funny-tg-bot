const { bot } = require("../index");
const { db } = require("../database/db");
const { generateWeatherReport } = require("../services/weatherService");
const { followersArray, followers } = require("../store/followersStore");
const { TIME_SEND_WEATHER_REPORT } = require("../utils/constants");
const { getDateInYYYYMMDD } = require("../utils/helpers");
const { updateFollowers } = require("./updateDate");

async function sendDailyWeatherReport() {
  if (formatDate(new Date()) < TIME_SEND_WEATHER_REPORT) {
    return;
  }

  const currentDate = getDateInYYYYMMDD(new Date());
  const lastSentDayMailing = db.prepare('SELECT day FROM lastSentDayMailing').get();

  if (lastSentDayMailing?.day === currentDate) {
    console.log('День отправки прогноза погоды соответствует текущему дню.');
    return;
  }

  const weatherReport = await generateWeatherReport();

  updateFollowers();

  for (const follower of followersArray) {
    const chatId = follower.chatId;
    const username = follower.username;

    db.prepare(`
      UPDATE followers
      SET isSentWeatherReport = 0
      WHERE chatId = ?
    `).run(chatId);

    const isSentWeatherReport = db.prepare(`
      SELECT isSentWeatherReport
      FROM followers
      WHERE chatId = ?
    `).get(chatId).isSentWeatherReport;

    if (isSentWeatherReport) {
      console.log(`User: ${username} уже получил прогноз погоды.`);
      continue;
    }
    
    try {
      await bot.sendMessage(chatId, weatherReport);
      await bot.sendMessage(chatId, 'В ближайшем будущем появится возможность добавить город для прогноза погоды, но на вашем месте я бы переехал в Питер 💅💅💅');

      db.prepare(`
        UPDATE followers
        SET isSentWeatherReport = ?
        WHERE chatId = ?
      `).run(1, chatId);
    } catch (error) {
      console.error(`Ошибка отправки прогноза погоды для ${chatId}:`, error);
      if (error.response?.body?.error_code === 403) {
        db.prepare('DELETE FROM followers WHERE chatId = ?').run(chatId);
        followers.delete(chatId);
      }
    }
    
    const isSentWeatherReportForAllFollowers = followersArray.every((follower) => follower.isSentWeatherReport !== 0);
    if (isSentWeatherReportForAllFollowers) {
      db.prepare(`
        INSERT OR REPLACE INTO lastSentDayMailing (day)
        VALUES (?)
      `).run(currentDate);
    }
  }
};

module.exports = {
  sendDailyWeatherReport
}