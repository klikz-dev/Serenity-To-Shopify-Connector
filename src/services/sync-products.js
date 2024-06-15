const { createAkeneoClient } = require('../lib/akeneo');
const { createShopifyClient } = require('../lib/shopify');

const syncProducts = ({ store }) => {
  const akeneoClient = createAkeneoClient();
  const shopifyClient = createShopifyClient(store);

  console.log(akeneoClient);
  console.log(shopifyClient);
};

module.exports = { syncProducts };
