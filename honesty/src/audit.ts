import { readFile, appendFile } from "fs/promises";
import { join } from "path";
import { prompt } from "inquirer";
import chalk from "chalk";

const { cyan, red, green, yellow, blue, magenta, magentaBright } = chalk;

(async () => {
  const targetFile = process.argv[2];
  const certString = targetFile.split(".")[0];
  const content = await readFile(
    join(process.cwd(), "audited", targetFile),
    "utf-8"
  );
  const entries: string[] = content.split("\n");

  const total = entries.length;
  let current = 1;

  for (const entry of entries) {
    const [id, first, second, third, fourth, fifth] = entry.split(",");
    const [
      ,
      idString,
      firstString,
      secondString,
      thirdString,
      fourthString,
      fifthString,
    ] = JSON.stringify(
      { id, first, second, third, fourth, fifth },
      null,
      2
    ).split("\n");
    const entryString = [
      "{",
      magentaBright(idString),
      red(firstString),
      yellow(secondString),
      cyan(thirdString),
      green(fourthString),
      blue(fifthString),
      "}",
    ].join("\n");
    const shouldFlag = await prompt([
      {
        type: "confirm",
        name: "flagged",
        default: false,
        message: `Camper ${current} of ${total}:\n${entryString}]\nFlag this for review?`,
      },
    ]);

    if (shouldFlag.flagged) {
      const logString = `${id},${first},${second},${third},${fourth},${fifth},`;

      await appendFile(
        join(process.cwd(), "reviewed", certString + "-cheaters.txt"),
        `${logString}\n`,
        "utf-8"
      );
    }

    current++;
  }
})();
