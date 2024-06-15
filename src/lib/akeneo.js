const createClient = require('@craftzing/akeneo-api').default;

const createAkeneoClient = () => {
  const akeneoClient = createClient({
    url: process.env.AKENEO_URL,
    username: process.env.AKENEO_USERNAME,
    password: process.env.AKENEO_PASSWORD,
    clientId: process.env.AKENEO_CLIENT_ID,
    secret: process.env.AKENEO_CLIENT_SECRET,
  });

  return akeneoClient;
};

module.exports = { createAkeneoClient };
