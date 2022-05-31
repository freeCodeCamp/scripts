import { readFile, appendFile } from "fs/promises";
import { join } from "path";

(async () => {
  const fileName = process.argv[2];
  const resultsLog = join(
    process.cwd(),
    "audited",
    fileName.split(".")[0] + ".json"
  );

  const getFlaggedList = await readFile(
    join(process.cwd(), "flagged", fileName),
    "utf-8"
  );
  const flaggedIds = getFlaggedList.split("\n").map((str) => str.split(",")[0]);

  const unauditedList = await readFile(
    join(process.cwd(), "logs", fileName),
    "utf-8"
  );
  const lines = unauditedList.split("\n");

  await appendFile(resultsLog, "[\n");

  for (const line of lines) {
    const [id, first, second, third, fourth, fifth] = line.split(",");
    if (flaggedIds.includes(id)) {
      const obj = { id, first, second, third, fourth, fifth };
      await appendFile(
        resultsLog,
        JSON.stringify(obj, null, 2) + ",\n",
        "utf-8"
      );
    }
  }

  await appendFile(resultsLog, "]", "utf-8");
})();
