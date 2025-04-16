class PredictionsService {
  constructor(pgPool) {
    this.pgPool = pgPool
    this._goodPredictions = []
    this._badPredictions = []
  }

  async loadGoodPredictions() {
    try {
      const result = await this.pgPool.query('SELECT * from good_predictions');
      this._goodPredictions = [...result.rows];
      return this._goodPredictions;
    } catch (error) {
      console.error('Ошибка при загрузке хороший предсказаний из БД: ', error.message);
      this.bot.sendMessage(chatId, 'Упс... что-то пошло не так. Попробуйте еще раз');
    }
  }

  async loadBadPredictions() {
    try {
      const result = await this.pgPool.query('SELECT * from bad_predictions');
      this._badPredictions = [...result.rows];
      return this._badPredictions;
    } catch (error) {
      console.error('Ошибка при загрузке плохих предсказаний из БД: ', error.message);
      this.bot.sendMessage(chatId, 'Упс... что-то пошло не так. Попробуйте еще раз');
    }
  }

  getGoodPredictions() {
    return this._goodPredictions;
  }

  getBadPredictions() {
    return this._badPredictions;
  }
}

module.exports = PredictionsService