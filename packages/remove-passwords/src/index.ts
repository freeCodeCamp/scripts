import { MongoClient } from "mongodb";
import Spinnies from "spinnies";

import { userSchema } from "./schema";

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

  const db = dbClient.db("freecodecamp");
  const users = db.collection("user");

  const stream = users
    .find({
      password: { $exists: true },
    })
    .batchSize(50)
    .stream();

  spinnies.add("query", {
    color: "magenta",
    text: "Running database query...",
  });

  stream.on("data", (document: userSchema) => {
    stream.pause();
    spinnies.update("query", { text: `Processing user ${document._id}` });
    users.updateOne({ _id: document._id }, { $unset: { password: true } });
    stream.resume();
  });

  stream.on("end", () => {
    dbClient.close();
    spinnies.succeed("query", { text: "All done!" });
  });
})();
