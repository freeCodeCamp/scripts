import Stream from "stream";
import { createWriteStream } from "fs";

import { MongoClient } from "mongodb";
import { userSchema } from "./schema";
import Spinnies from "spinnies";
import { join } from "path";

const spinnies = new Spinnies({
  spinner: {
    interval: 80,
    frames: [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱",
    ],
  },
});

(async () => {
  const dbClient = await MongoClient.connect(process.env.MONGO_URI as string, {
    replicaSet: "atlas-axsdig-shard-0",
    maxPoolSize: 20,
  });
  console.log("Connected to MongoDB");

  const filePath = join(process.cwd(), "results", "dupe-emails.csv");
  const file = createWriteStream(filePath);

  const db = dbClient.db("freecodecamp");
  const users = db.collection("user");

  const rs = new Stream.Readable({ objectMode: true });
  rs._read = () => {};

  rs.on("data", (document: userSchema) => {
    file.write(`${document._id}\n`);
  });

  const stream = users
    .aggregate(
      [
        {
          $group: {
            _id: { $toLower: "$email" },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ],
      {
        allowDiskUse: true,
        hint: "_id_1_email_1",
      }
    )
    .batchSize(50)
    .stream();

  spinnies.add("query", {
    color: "magenta",
    text: "Running database query...",
  });

  stream.on("data", (document: userSchema) => {
    rs.push(document);
  });

  stream.on("end", () => {
    rs.push(null);
    dbClient.close();
    spinnies.succeed("query", { text: "All done!" });
  });
})();
