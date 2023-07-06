import fetch from "node-fetch";

import { UserList } from "./interfaces/UserList";

(async () => {
  const { BASE_URL: baseUrl, USER_ID: userId, TOKEN: token } = process.env;

  if (!baseUrl || !userId || !token) {
    throw new Error("Missing API credentials.");
  }

  const headers = {
    "X-Auth-Token": token,
    "X-User-Id": userId,
  };

  const allUsers = await fetch(`${baseUrl}/api/v1/users.list?count=0`, {
    headers,
  });
  const allUsersData = (await allUsers.json()) as UserList;

  const otherAccountsData = allUsersData["users"].filter(
    (user) => !user.roles.includes("Staff") && !user.roles.includes("bot")
  );

  for (const user of otherAccountsData) {
    console.log("Deleted user: ", user["_id"]);
    // await fetch(`${baseUrl}/api/v1/users.delete`, {
    //   method: "POST",
    //   headers: headers,
    //   body: JSON.stringify({
    //     userId: user["_id"],
    //   }),
    // });
  }
})();
