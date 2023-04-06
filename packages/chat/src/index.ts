import { writeFile } from "fs/promises";
import { join } from "path";

import fetch from "node-fetch";

import { UserList } from "./interfaces/UserList";

(async () => {
  const { BASE_URL: baseUrl, USER_ID: userId, TOKEN: token } = process.env;

  if (!baseUrl || !userId || !token) {
    throw new Error("Missing API credentials.");
  }

  const emails: string[] = [];

  const headers = {
    "X-Auth-Token": token,
    "X-User-Id": userId,
  };

  const endpoint = "/api/v1/users.list";
  const fields = { name: 1, emails: 1 };
  let offset = 0;
  const url = `${baseUrl}${endpoint}?fields=${JSON.stringify(fields)}`;

  console.log("Fetching first 50 users...");

  let response = await fetch(url + `&offset=${offset}`, { headers });
  let parsed = (await response.json()) as UserList;

  emails.push(
    ...parsed.users.map((user) => user.emails?.[0]?.address || "no email found")
  );

  while (emails.length < parsed.total) {
    console.log(`Fetching next 50 users... (${emails.length}/${parsed.total})`);
    offset += parsed.count;
    response = await fetch(url + `&offset=${offset}`, { headers });
    parsed = (await response.json()) as UserList;
    emails.push(
      ...parsed.users.map(
        (user) => user.emails?.[0]?.address || "no email found"
      )
    );
  }

  await writeFile(
    join(process.cwd(), "emails.txt"),
    emails.join("\n"),
    "utf-8"
  );
})();
