require('dotenv').config();
const { app } = require('@azure/functions');
const { syncProducts } = require('../services/sync-products');

app.http('sync-product', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const { store } = JSON.parse(await request.text());

      if (!store) {
        return {
          status: 400,
          body: `Bad Request: "store" is required ${request.body}`,
        };
      }

      context.log(`Product Sync request for store "${store}"`);

      await syncProducts({ store: store });

      return { body: `${store} store sync has been completed successfully` };
    } catch (error) {
      context.error('Error handling request:', error);
      return { status: 500, body: 'Internal Server Error' };
    }
  },
});
