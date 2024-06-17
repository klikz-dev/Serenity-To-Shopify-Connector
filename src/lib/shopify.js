const { createAdminApiClient } = require('@shopify/admin-api-client');

const createShopifyClient = (store) => {
  switch (store) {
    case 'CrawlTek':
      return createAdminApiClient({
        storeDomain: process.env.SHOPIFY_CRAWLTEK_STORE_DOMAIN,
        apiVersion: process.env.SHOPIFY_CRAWLTEK_API_VERSION,
        accessToken: process.env.SHOPIFY_CRAWLTEK_API_TOKEN,
      });

    case 'Ridefox':
      return createAdminApiClient({
        storeDomain: process.env.SHOPIFY_RIDEFOX_STORE_DOMAIN,
        apiVersion: process.env.SHOPIFY_RIDEFOX_API_VERSION,
        accessToken: process.env.SHOPIFY_RIDEFOX_API_TOKEN,
      });

    default:
      break;
  }

  console.error(`${store} is unknown`);
};

module.exports = { createShopifyClient };
