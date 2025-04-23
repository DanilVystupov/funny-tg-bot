class DescriptionsService {
  constructor(pgPool, bot) {
    this.pgPool = pgPool;
    this.bot = bot;
  }

  async getDescriptions() {
    const result = await this.pgPool.query(`SELECT * FROM funny_descriptions`);
    return result.rows;
  }
}

module.exports = DescriptionsService