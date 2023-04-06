import { readdir, readFile, appendFile } from "fs/promises";
import { join } from "path";

(async () => {
  const file = await readFile(
    join(process.cwd(), "audited", "isRespWebDesignCert.json"),
    "utf-8"
  );
  const json = (await JSON.parse(file)) as {
    id: string;
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
  }[];

  for (const obj of json) {
    const { id, first, second, third, fourth, fifth } = obj;
    const logString = `${id},${first},${second},${third},${fourth},${fifth},`;
    await appendFile(
      join(process.cwd(), "reviewed", "isRespWebDesignCert-cheaters.txt"),
      `${logString}\n`,
      "utf-8"
    );
  }
})();
