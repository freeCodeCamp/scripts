import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

(async () => {
  const fileName = process.argv[2];
  const audited = await readFile(
    join(process.cwd(), "audited", fileName),
    "utf-8"
  );

  const ids = new Set<string>();
  const reviewed = await readdir(join(process.cwd(), "reviewed"));

  const filtered: string[] = [];

  for (const file of reviewed) {
    console.log(`Processing ${file}...`);
    const content = await readFile(
      join(process.cwd(), "reviewed", file),
      "utf-8"
    );
    const entries = content.split("\n");

    for (const entry of entries) {
      const [id] = entry.split(",");

      ids.add(id);
    }
  }

  const lines = audited.split("\n");
  for (const line of lines) {
    const [id] = line.split(",");
    if (!ids.has(id)) {
      filtered.push(line);
    }
  }

  await writeFile(
    join(process.cwd(), "filtered", fileName),
    filtered.join("\n")
  );
})();
