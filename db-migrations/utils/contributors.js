const path = require("path");
const fs = require("fs");

const contributors = fs
  .readFileSync(path.resolve(__dirname, "../data/contributors.txt"), "utf8")
  .split("\n")
  .filter(Boolean);

module.exports = contributors;
