class BaseCommand {
  constructor(botService) {
    this.bot = botService.bot;
    this.db = botService.db;
    this.followers = botService.followers;
    this.predictionsStore = botService.predictionsStore;
    this.userData = botService.userData;
  }

  execute() {
    throw new Error('Метод execute() должен быть реализован')
  }
}

module.exports = BaseCommand