import { appendFile, readdir, readFile } from "fs/promises";
import { MongoClient, ObjectId } from "mongodb";
import { join } from "path";
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
  const ids = new Set<string>();
  const reviewed = await readdir(join(process.cwd(), "reviewed"));

  for (const file of reviewed) {
    console.log(`Processing ${file}...`);
    const content = await readFile(
      join(process.cwd(), "reviewed", file),
      "utf-8"
    );
    const entries = content.split("\n");

    for (const entry of entries) {
      const [id] = entry.split(",");

      if (!id) {
        continue;
      }

      ids.add(id);
    }
  }

  const total = ids.size;

  const filePath = join(process.cwd(), "flagged.csv");
  const notFoundFile = join(process.cwd(), "not-found.csv");

  const dbClient = await MongoClient.connect(process.env.MONGO_URI as string);
  const db = dbClient.db("freecodecamp");

  const collection = db.collection("user");

  spinnies.add("query", {
    color: "magenta",
    text: "Running database query...",
  });

  let count = 1;

  for (const id of ids) {
    spinnies.update("query", { text: `Fetching ${id}... (${count}/${total})` });
    const record = await collection.findOne<userSchema>({
      _id: new ObjectId(id),
    });
    count++;
    if (!record) {
      await appendFile(notFoundFile, `${id}\n`, "utf-8");
      continue;
    }
    await appendFile(
      filePath,
      `${id},${record.username},${record.email}\n`,
      "utf-8"
    );
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isCheater: true } }
    );
  }
})();
