class BaseCommand {
  constructor(botService) {
    this.bot = botService.bot;
    this.pgPool = botService.pgPool;
    this.userData = botService.userData;
    this.followersService = botService.followersService;
    this.predictionsService = botService.predictionsService;
    this.descriptionsService = botService.descriptionsService;
  }

  execute() {
    throw new Error('Метод execute() должен быть реализован')
  }
}

module.exports = BaseCommand