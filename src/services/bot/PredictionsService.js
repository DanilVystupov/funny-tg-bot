class PredictionsService {
  constructor(pgPool, bot) {
    this.pgPool = pgPool;
    this.bot = bot;
  }

  async getGoodPredictions() {
    const result = await this.pgPool.query('SELECT * from good_predictions');
    return result.rows;
  }

  async getBadPredictions() {
    const result = await this.pgPool.query('SELECT * from bad_predictions');
    return result.rows;
  }
}

module.exports = PredictionsService