const CRAWLTEK_CONFIG = require('../config/crawltek.json');

const loadConfig = (store) => {
  switch (store) {
    case 'CrawlTek':
      return CRAWLTEK_CONFIG;

    default:
      return null;
  }
};

module.exports = loadConfig;
