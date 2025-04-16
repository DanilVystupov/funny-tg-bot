const { getRandomMonkeyGif } = require("../gifService");

class FollowersService {
  constructor(pgPool) {
    this.pgPool = pgPool
    this._followers = [];
  }

  async loadFollowers() {
    try {
      const result = await this.pgPool.query('SELECT * FROM followers');
      this._followers = [...result.rows];
      return this._followers;
    } catch (error) {
      console.error('Ошибка при загрузке followers из БД: ', error);
      throw error;
    }
  }

  async addFollower(chatid, username) {
    try {
      const result = await this.pgPool.query(`
        INSERT INTO followers (chatid, username)
        VALUES ($1, $2)
        RETURNING *
      `, [chatid, username]);

      const newFollower = {...result.rows[0]};

      this._followers.push(newFollower);
      return this._followers;
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

      this._followers = this._followers.filter((follower) => follower.chatid !== chatid);
      return this._followers;
    } catch (error) {
      console.error('Ошибка при удалении пользователя', error);
      throw error;
    }
  }

  async sendDailyBibizyan() {
    try {
      for (const follower of this._followers) {
        const chatid = follower.chatid;
        const { url, description } = await getRandomMonkeyGif();
        await this.bot.sendAnimation(chatid, url, { caption: description });
      }
    } catch (error) {
      console.log('Ошибка при отправке ежедневных бибизян: ', error.message);
    }
  }

  getFollowers() {
    return this._followers;
  }

  hasFollower(chatid) {
    return this._followers.some((follower) => follower.chatid === chatid);
  }
}

module.exports = FollowersService