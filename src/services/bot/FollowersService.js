const { delay } = require("../../utils/helpers");
const { getRandomMonkeyGif } = require("../gifService");

class FollowersService {
  constructor(pgPool, bot) {
    this.pgPool = pgPool;
    this.bot = bot;
  }

  async addFollower(chatid, username) {
    try {
      await this.pgPool.query(`
        INSERT INTO followers (chatid, username)
        VALUES ($1, $2)
        ON CONFLICT (chatid) DO NOTHING
        RETURNING *
      `, [chatid, username]);
    } catch (error) {
      console.error('Ошибка при добавлении нового пользователя', error);
      throw error;
    }
  }

  async removeFollower(chatid) {
    try {
      await this.pgPool.query(`
        DELETE FROM followers
        WHERE chatid = $1
      `, [chatid]);
    } catch (error) {
      console.error('Ошибка при удалении пользователя', error);
      throw error;
    }
  }

  async sendDailyBibizyan() {
    console.log('sendDailyBibizyan вызван в', new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }));
    try {
      const followers = await this.getFollowers();
      for (const follower of followers) {
        const { chatid, username } = follower;
        const { url, description } = await getRandomMonkeyGif();
        await this.bot.sendAnimation(chatid, url, { caption: description });
        await delay(1000);
        console.log(`Бибизян успешно отправлен для ${username}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке ежедневных бибизян: ', error);
    }
  }

  async getFollowers() {
    const result = await this.pgPool.query('SELECT * FROM followers');
    return result.rows;
  }

  async hasFollower(chatid) {
    const result = await this.pgPool.query(`
      SELECT 1 FROM followers
      WHERE chatid = $1
      LIMIT 1
    `, [chatid]);

    return result.rowCount > 0;
  }
}

module.exports = FollowersService