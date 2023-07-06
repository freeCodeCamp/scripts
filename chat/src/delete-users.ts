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
    "Content-type": "application/json",
  };

  const allUsers = await fetch(`${baseUrl}/api/v1/users.list?count=0`, {
    headers,
  });
  const allUsersData = (await allUsers.json()) as UserList;

  const otherAccountsData = allUsersData["users"].filter(
    (user) => !user.roles.includes("Staff") && !user.roles.includes("bot")
  );

  console.log("Total users: ", allUsersData["total"]);

  for (const user of otherAccountsData) {
    const response = await fetch(`${baseUrl}/api/v1/users.delete`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        userId: user["_id"],
      }),
    });
    const responseJson = await response.json();
    if (responseJson.success === true) {
      console.log("Deleted user: ", user["_id"]);
    } else {
      console.log("Failed to delete user: ", user["_id"]);
    }
  }

  console.log("Remaining users: ", allUsersData["total"]);
})();
