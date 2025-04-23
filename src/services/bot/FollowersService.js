const { delay } = require("../../utils/helpers");
const { getRandomMonkeyGif } = require("../gifService");

class FollowersService {
  constructor(pgPool, bot, descriptionsService) {
    this.pgPool = pgPool;
    this.bot = bot;
    this.descriptionsService = descriptionsService;
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
    const followers = await this.getFollowers();
    const descriptions = await this.descriptionsService.getDescriptions();
    for (const follower of followers) {
      const { chatid, username } = follower;
      try {
        const { url, description } = await getRandomMonkeyGif(descriptions);
        console.log(`Отправка для ${username} (${chatid}): URL=${url}, description=${description}`);
        await this.bot.sendAnimation(chatid, url, { caption: description });
        console.log(`Бибизян успешно отправлен для ${username} (${chatid})`);
      } catch (error) {
        console.error(`Ошибка отправки мема для ${username} (${chatid}):`, error.stack);
      }
      await delay(2000);
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