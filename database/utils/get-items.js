const path = require("path");
const fs = require("fs");

const getItems = file =>
  fs
    .readFileSync(path.resolve(__dirname, "../data/" + file), "utf8")
    .split("\n")
    .filter(Boolean);

module.exports = getItems;
