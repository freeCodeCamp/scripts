import { readdir } from "fs/promises";
import { join } from "path";

import { logHandler } from "./logHandler";

/**
 * Module to get the file names within the data directory, excluding any
 * that are not .csv files.
 *
 * @returns {string[]} An array of file names.
 */
export const getFileNames = async () => {
  logHandler.log("info", "Reading files in the data directory...");
  const dataDirectory = join(process.cwd(), "data");
  const files = await readdir(dataDirectory);
  const filtered = files.filter((file) => file.endsWith(".csv"));
  logHandler.log("info", `Found ${filtered.length} CSV files.`);
  return filtered;
};
