import { readFile, appendFile } from "fs/promises";
import { join } from "path";

const getUser = (first: string) => {
  return (
    // github repositories
    first.match(/github\.com\/[^/]*/g)?.[0].split("/")[1] ||
    // codepens
    first.match(/codepen.io\/[^/]*/g)?.[0].split("/")[1] ||
    // replits
    first.match(/(@[^/])/g)?.[0] ||
    // github pages
    first.match(/[^.]\.github\.io/g)?.[0] ||
    ""
  );
};

(async () => {
  const fileName = process.argv[2];
  const resultsLog = join(process.cwd(), "flagged", fileName);

  const logs = await readFile(join(process.cwd(), "logs", fileName), "utf8");

  const lines = logs.split("\n");

  for (const line of lines) {
    const [id, first, second, third, fourth, fifth] = line.split(",");

    if (!first || !second || !third || !fourth || !fifth) {
      await appendFile(resultsLog, `${id},missing submissions\n`);
      continue;
    }

    if (
      [first, second, third, fourth, fifth].every((line) =>
        /freecodecamp/i.test(getUser(line) || "")
      )
    ) {
      await appendFile(resultsLog, `${id},submitted only freeCodeCamp\n`);
      continue;
    }

    if (
      new Set([
        getUser(first),
        getUser(second),
        getUser(third),
        getUser(fourth),
        getUser(fifth),
      ]).size > 3
    ) {
      await appendFile(resultsLog, `${id},four or five usernames detected.\n`);
      continue;
    }

    if (
      [
        getUser(first),
        getUser(second),
        getUser(third),
        getUser(fourth),
        getUser(fifth),
      ].some((el) => !el)
    ) {
      await appendFile(resultsLog, `${id},missing usernames\n`);
      continue;
    }

    const set = new Set([first, second, third, fourth, fifth]);

    if (set.size < 2) {
      await appendFile(resultsLog, `${id},repeated submissions detected.\n`);
      continue;
    }
  }
})();
