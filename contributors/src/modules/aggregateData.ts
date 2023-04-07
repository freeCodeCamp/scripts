import { readFile, writeFile } from "fs/promises";
import { join } from "path";

import { getFileNames } from "../utils/getFileNames";
import { logHandler } from "../utils/logHandler";

(async () => {
  logHandler.log("info", "Beginning data aggregation...");
  const fileNames = await getFileNames();
  const globalContributors: string[] = [];
  for (const file of fileNames) {
    logHandler.log("info", `Aggregating data from ${file}...`);
    const filePath = join(process.cwd(), "data", file);
    const content = await readFile(filePath, "utf8");
    const contributors = content.split("\n").slice(1);
    const mappedContributors = contributors.map((el) => {
      if (!el) {
        return "";
      }
      const [name, url] = el.split(",");
      return url ? `- [${name}](${url})` : `- ${name}`;
    });
    globalContributors.push(...mappedContributors.filter((el) => el));
  }
  logHandler.log("info", "Writing data to output file...");
  const outputFile = join(process.cwd(), "data", "contributors.md");
  const sorted = globalContributors.sort((a, b) =>
    a
      .replace(/\W/gi, "")
      .toLowerCase()
      .localeCompare(b.replace(/\W/gi, "").toLowerCase())
  );
  await writeFile(outputFile, sorted.join("\n"));
  logHandler.log("info", "Data aggregation complete!");
})();
