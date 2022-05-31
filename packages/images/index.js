const sharp = require(`sharp`);
const glob = require(`glob`);
const PromisePool = require('@supercharge/promise-pool');
const ora = require('ora');

// CHANGE THE SOURCE AND THE DESTINATION BEFORE EXECUTING THE SCRIPT
const images = glob.sync(`sources/cdn-media-2/originals/*.{png,jpg,jpeg}`);
const MAX_WIDTH = 1280;
const QUALITY = 90;

const spinner = ora();
try {
  (async () => {
    const errors = [];
    spinner.info(`Images to be optimized: ${images.length}`);
    const { results } = await PromisePool.for(images)
      .withConcurrency(20)
      .handleError(async (error, image) => {
        errors.push({
          error: error,
          name: image
        });
        spinner.fail(`Failed for: ${image}`);
      })
      .process(async (image) => {
        const stream = sharp(image);
        const info = await stream.metadata();

        spinner.text = `Processing: ${image}`;
        spinner.start();

        if (info.width < MAX_WIDTH) {
          return;
        }

        // CHANGE THE SOURCE AND THE DESTINATION BEFORE EXECUTING THE SCRIPT
        const destinationImage = image.replace(/(originals)/, () => `w1280`);

        await stream
          .resize(MAX_WIDTH)
          .jpeg({ quality: QUALITY })
          .toFile(destinationImage);

        spinner.clear();
        return destinationImage;
      });
    spinner.frame();
    spinner.succeed(`Completed processing: ${results.length}`);
    if (errors.length) {
    }
  })();
} catch (error) {
  console.error(error);
}
