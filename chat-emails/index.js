const { MongoClient } = require("mongodb");
const { createWriteStream } = require("fs");
const { join } = require("path");
const Stream = require("stream");

(async () => {
  const dbClient = await MongoClient.connect(process.env.MONGO_URI, {
    replicaSet: "atlas-vdc3ii-shard-0",
    maxPoolSize: 20,
  });
  const db = dbClient.db("rocketchat");
  const users = db.collection("users");

  const filePath = join(process.cwd(), "emails.csv");
  const file = createWriteStream(filePath);
  file.write("email,unsubscribeId\n");

  const rs = new Stream.Readable({ objectMode: true });
  rs._read = () => {};

  rs.on("data", (document) => {
    file.write(`${document.email},null\n`);
  });

  const stream = users.find({}).stream();

  stream.on("data", (document) => {
    rs.push(document);
  });

  stream.on("end", () => {
    rs.push(null);
    dbClient.close();
  });
})();
