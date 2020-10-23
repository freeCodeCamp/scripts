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

module.exports = {
  wait,
  asyncForEach
}
