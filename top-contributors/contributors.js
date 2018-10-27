const fs = require('fs');

const contributors = fs.readFileSync(
    './contributors.txt',
    'utf8'
).split('\n').filter(Boolean);

module.exports = contributors;
