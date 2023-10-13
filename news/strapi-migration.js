require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');


async function formatTagData() {

  const object = {
    tags: []
  }

  const url = `${process.env.NEWS_API_URL}/ghost/api/v3/content/tags/?key=${process.env.NEWS_API_KEY}`;
  const tags = await fetch(url).then(res => res.json());

  const tagsModified = tags['tags'].map(tag => {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }
  })

  object.tags = [...tagsModified]

  // writing to file for now
  fs.writeFile('./tags.json', JSON.stringify(object, null, 2), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

async function migrate() {
  formatTagData();
}

migrate();
