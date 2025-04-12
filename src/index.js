const botService = require('./bot');
const createMailingService = require('./functions/mailing');

const mailingService = createMailingService(botService.bot);