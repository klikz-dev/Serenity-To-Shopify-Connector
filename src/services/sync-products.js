const { createAkeneoClient } = require('../lib/akeneo');
const { createShopifyClient } = require('../lib/shopify');
const loadConfig = require('../utils/load-config');

const syncProducts = async ({ store }) => {
  /**
   * Get Akeneo Products
   */
  const akeneoConfig = loadConfig(store);
  const akeneoClient = createAkeneoClient();

  const akeneoProductsData = await akeneoClient.product.getAll({
    query: {
      search: JSON.stringify({
        publish: [
          {
            operator: 'IN',
            value: [akeneoConfig.publish_key],
          },
        ],
        enabled: [
          {
            operator: '=',
            value: true,
          },
        ],
      }),
    },
  });

  const akeneoProducts = akeneoProductsData?.items?.filter((item) => {
    return (
      !item?.parent &&
      !item.categories.some((category) =>
        akeneoConfig.excludes.includes(category),
      )
    );
  });

  console.log(akeneoProducts.length);

  console.log(JSON.stringify(akeneoProducts[0], null, 2));

  /**
   * Get Shopify Products
   */
  const shopifyClient = createShopifyClient(store);

  const { data: shopifyProductsData, errors } = await shopifyClient.request(
    `
      query {
        products(first: 250, reverse: true) {
          edges {
            node {
              id
              title
              handle
              variants (first: 100) {
                edges {
                  node {
                    sku
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        id: 'gid://shopify/Product/7608002183224',
      },
    },
  );
  console.log(shopifyProductsData);
  console.log(errors);

  const shopifyProducts = shopifyProductsData.products.edges.filter(
    (product) => product.node.variants.edges.length === 1,
  );

  console.log(shopifyProducts?.[0]);

  /**
   * Compare Akeneo and Shopify Products
   */
  const allAkeneoSKUs = akeneoProducts.map(
    (product) => product.values.sku[0].data,
  );
  const allShopifySKUs = shopifyProducts.map(
    (product) => product.node.variants.edges[0].node.sku,
  );

  const skusToDelete = allShopifySKUs.filter(
    (sku) => !allAkeneoSKUs.includes(sku),
  );
  const skusToUpload = allAkeneoSKUs.filter(
    (sku) => !allShopifySKUs.includes(sku),
  );
  const skusToUpdate = allAkeneoSKUs.filter((sku) =>
    allShopifySKUs.includes(sku),
  );

  console.log(skusToUpload);
  console.log(skusToUpdate);
  console.log(skusToDelete);

  /**
   * Update Products
   */
  const akeneoProductsToUpload = akeneoProducts.filter((product) =>
    skusToUpdate.includes(product.values.sku[0].data),
  );
};

module.exports = { syncProducts };
