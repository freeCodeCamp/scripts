import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const github = async () => {
  const oldEmails = await readFile(
    join(process.cwd(), "data", "old.csv"),
    "utf-8"
  );
  const newEmails = await readFile(
    join(process.cwd(), "data", "github.csv"),
    "utf-8"
  );

  // Name,GitHub URL,Merged PRs,fCC Profile,Email
  const oldEmailsArray = oldEmails.split("\n");
  // name,github-url,commits,email
  const newEmailsArray = newEmails.trim().split("\n").slice(1);

  for (const line of newEmailsArray) {
    const [name, url, commits, email] = line.split(",");
    const existingRecordIndex = oldEmailsArray.findIndex((record) =>
      record.includes(url)
    );
    const existingRecord = oldEmailsArray[existingRecordIndex];
    const updatedRecord =
      existingRecord?.split(",").length > 5
        ? existingRecord
        : `${existingRecord?.trim()}${email}`;
    existingRecordIndex !== -1
      ? oldEmailsArray.splice(existingRecordIndex, 1, updatedRecord)
      : oldEmailsArray.push(`${name},${url},${commits},,${email}`);
  }

  await writeFile(
    join(process.cwd(), "data", "old.csv"),
    oldEmailsArray.join("\n")
  );
};

const forum = async () => {
  const oldEmails = await readFile(
    join(process.cwd(), "data", "old.csv"),
    "utf-8"
  );
  const newEmails = await readFile(
    join(process.cwd(), "data", "forum.csv"),
    "utf-8"
  );

  // Name, Forum URL, Solutions, fcc profile, email
  const oldEmailsArray = oldEmails.split("\n");
  // name,forum-url,solutions,email
  const newEmailsArray = newEmails.trim().split("\n").slice(1);

  for (const line of newEmailsArray) {
    const [name, url, solutions, email] = line.split(",");
    console.log(`Processing ${url}`);
    const existingRecordIndex = oldEmailsArray.findIndex((record) =>
      record.includes(url)
    );
    const existingRecord = oldEmailsArray[existingRecordIndex];
    const updatedRecord =
      existingRecord?.split(",").length > 5
        ? existingRecord
        : `${existingRecord?.trim()}${email}`;
    existingRecordIndex !== -1
      ? oldEmailsArray.splice(existingRecordIndex, 1, updatedRecord)
      : oldEmailsArray.push(`${name},${url},${solutions},,${email}`);
  }

  await writeFile(
    join(process.cwd(), "data", "old.csv"),
    oldEmailsArray.join("\n")
  );
};

const modules: { [key: string]: () => Promise<void> } = {
  github,
  forum,
};

(async () => {
  const module = process.argv[2];
  modules[module]
    ? await modules[module]()
    : console.log(`Invalid module: ${module}`);
})();
