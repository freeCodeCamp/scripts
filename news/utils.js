const WAIT_BETWEEN_CALLS = process.env.WAIT_BETWEEN_CALLS || 1;

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await wait(WAIT_BETWEEN_CALLS);
    await callback(array[index], index, array);
  }
}

const keys = {
  en: {
    url: process.env.NEWS_API_URL,
    key: process.env.NEWS_API_ADMIN_KEY,
    version: process.env.NEWS_API_VERSION || 'v2',
  },
  zh: {
    url: process.env.ZH_NEWS_API_URL,
    key: process.env.ZH_NEWS_API_ADMIN_KEY,
    version: process.env.ZH_NEWS_API_VERSION || 'v2',
  },
  es: {
    url: process.env.ES_NEWS_API_URL,
    key: process.env.ES_NEWS_API_ADMIN_KEY,
    version: process.env.ES_NEWS_API_VERSION || 'v2',
  },
  getter: {
    url: process.env.GETTER_NEWS_API_URL,
    key: process.env.GETTER_NEWS_API_ADMIN_KEY,
    version: 'v2'
  },
  setter: {
    url: process.env.SETTER_NEWS_API_URL,
    key: process.env.SETTER_NEWS_API_ADMIN_KEY,
    version: 'v3'
  }
};

module.exports = {
  wait,
  asyncForEach,
  keys
}
