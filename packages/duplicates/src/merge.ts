import { readFile, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";

import { MongoClient, ObjectId } from "mongodb";
import Spinnies from "spinnies";
import { userSchema } from "./schema";
import fetch from "node-fetch";

const spinnies = new Spinnies({
  spinner: {
    interval: 80,
    frames: [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱",
    ],
  },
});

const certificationProperties = [
  "isFrontEndCert",
  "isDataVisCert",
  "isBackEndCert",
  "isFullStackCert",
  "isRespWebDesignCert",
  "is2018DataVisCert",
  "isFrontEndLibsCert",
  "isJsAlgoDataStructCert",
  "isApisMicroservicesCert",
  "isInfosecQaCert",
  "isQaCertV7",
  "isInfosecCertV7",
  "is2018FullStackCert",
  "isSciCompPyCertV7",
  "isDataAnalysisPyCertV7",
  "isMachineLearningPyCertV7",
  "isRelationalDatabaseCertV8",
];

const propertiesThatCanBeFalsy = [
  "name",
  "website",
  "twitter",
  "codepen",
  "linkedin",
  "about",
  "location",
  "isHonest",
  "isCheater",
  "acceptedPrivacyTerms",
  "isDonating",
  "sendQuincyEmail",
  "githubProfile",
  "emailVerified",
  "picture",
  "isBanned",
  "needsModeration",
  "keyboardShortcuts",
];

const arrayProperties = ["yearsTopContributor", "donationEmails"];

// These properties have manual logic in the merge process. Be careful when adding properties here.
const manuallyHandledProperties = [
  "completedChallenges",
  "progressTimestamps",
  "portfolio",
  "username",
  "usernameDisplay",
  "profileUI",
];

// These are the properties we don't want to worry about in the comparison
const ignoredProperties = [
  "emailVerifyTTL",
  // we ignore email because we know they're the same.
  "email",
  "emailVerified",
  "unsubscribeId",
  "newEmail",
  "emailAuthLinkTTL",
  "currentChallengeId",
  "partiallyCompletedChallenges",
  "rand",
  "timezone",
  "theme",
  "sound",
  "externalId",
  "password",
  "_csrf",
  "badges",
  "savedChallenges",
];

const defaultProfileUI = {
  isLocked: true,
  showAbout: false,
  showCerts: false,
  showDonation: false,
  showHeatMap: false,
  showLocation: false,
  showName: false,
  showPoints: false,
  showPortfolio: false,
  showTimeLine: false,
};

const completePropertyList = [
  ...certificationProperties,
  ...propertiesThatCanBeFalsy,
  ...arrayProperties,
  ...manuallyHandledProperties,
  ...ignoredProperties,
];

(async () => {
  // validate that the properties being edited are still on the schema.
  const userModelFromRepo = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/api-server/src/common/models/user.json"
  );
  const userModel = await userModelFromRepo.json();
  const extraneousKeys = completePropertyList.filter(
    (el) => !(el in userModel.properties)
  );
  if (extraneousKeys.length) {
    throw new Error(
      `The following keys are being used for the merge process but are no longer in the schema.\n\n${extraneousKeys.join(
        "\n"
      )}`
    );
  }
  const profileUISet = new Set(Object.keys(defaultProfileUI));
  const profileSchemaSet = new Set(
    Object.keys(userModel.properties.profileUI.default)
  );
  if (
    profileUISet.size !== profileSchemaSet.size ||
    ![...profileUISet].every((el) => profileSchemaSet.has(el))
  ) {
    throw new Error(
      "Mismatch between userSchema profileUI and default profileUI"
    );
  }
  const missingKeys = Object.keys(userModel.properties).filter(
    (el) => !completePropertyList.includes(el)
  );
  if (missingKeys.length) {
    throw new Error(
      `The following keys are present on the userSchema but not handled here.\n\n${missingKeys.join(
        "\n"
      )}`
    );
  }

  /**
   * This logic is used for the merge:verify script, which allows you to test that every key on the
   * user schema from /learn is being accounted for in the logic here.
   * !ALL DATABASE LOGIC SHOULD GO AFTER THIS LINE!
   */
  if (process.argv[2] === "--verify") {
    console.log("Schema validation looks good! Exiting process.");
    return;
  }

  const usernameLogPath = join(
    process.cwd(),
    "results",
    "merged-usernames.csv"
  );
  const portfolioLogPath = join(
    process.cwd(),
    "results",
    "merged-portfolios.csv"
  );
  const usernameLog = createWriteStream(usernameLogPath);
  const portfolioLog = createWriteStream(portfolioLogPath);

  const dbClient = await MongoClient.connect(process.env.MONGO_URI as string, {
    replicaSet: "atlas-2blby0-shard-0",
    maxPoolSize: 20,
  });
  const db = dbClient.db("freecodecamp");
  const users = db.collection("user");
  console.log("Connected to MongoDB");

  const filePath = join(process.cwd(), "results", "dupe-emails.csv");
  const file = await readFile(filePath, "utf8");
  const list = file.split("\n");

  spinnies.add("query", {
    color: "magenta",
    text: "Running database query...",
  });

  for (const entry of list) {
    const [email, ...ids] = entry.split(",");
    spinnies.update("query", { text: `Querying ${email}...` });
    const documents = await Promise.all(
      ids.map(
        async (id) => await users.findOne<userSchema>({ _id: new ObjectId(id) })
      )
    );
    const [first, ...rest] = documents.filter((el) => el) as userSchema[];
    // used for logging - email is not a username
    const usernames = [first.email, first.username];

    // arrays for merging
    const yearsTopContributor = [...(first.yearsTopContributor || [])];
    const profilePrivacySettings = first.profileUI || defaultProfileUI;

    // portfolio logic
    let hasPortfolio = !!first.portfolio?.length;

    for (const doc of rest) {
      // store username in log
      usernames.push(doc.username);

      for (const prop of arrayProperties) {
        if (doc[prop]?.length) {
          const whatsOnFirst = first[prop] || [];
          first[prop] = [
            ...whatsOnFirst,
            ...doc[prop].filter((el: string) => !whatsOnFirst.includes(el)),
          ];
        }
      }

      if (doc.profileUI) {
        for (const key in doc.profileUI) {
          // this key, when true, hides all the profile
          if (key === "isLocked" && doc.profileUI[key]) {
            profilePrivacySettings[key] = true;
            continue;
          }
          // other keys hide specific parts when FALSE
          if (!doc.profileUI[key]) {
            profilePrivacySettings[key] = false;
          }
        }
      }

      // portfolios are merged, but need to be flagged for manual review (check if duplicate entries exist)
      if (doc.portfolio?.length) {
        if (!first.portfolio) {
          first.portfolio = [];
        }
        first.portfolio.push(...doc.portfolio);
        if (!hasPortfolio) {
          hasPortfolio = true;
        } else {
          portfolioLog.write(`${doc.email}\n`);
        }
      }

      const firstChallengeIds = first.completedChallenges.map((el) => el.id);
      const firstTimestamps = first.progressTimestamps;

      // Test for fcc702071be-2afd-4370-8483-620a52f7b602 or fcc05b15ec5 formats
      const isDefaultUsername =
        /fcc[\w\d]{8}/.test(first.username) ||
        /fcc[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}/.test(
          first.username
        );

      if (isDefaultUsername) {
        first.username = doc.username;
        first.usernameDisplay = doc.usernameDisplay;
      }
      // filter, merge, sort completed challenges + progress timestamps
      const uniqueChallenges = doc.completedChallenges.filter(
        (el) => !firstChallengeIds.includes(el.id)
      );
      const uniqueTimestamps = doc.progressTimestamps.filter(
        (el) => !firstTimestamps.includes(el)
      );
      const mergedChallenges = [
        ...first.completedChallenges,
        ...uniqueChallenges,
      ];
      const mergedTimestamps = [
        ...first.progressTimestamps,
        ...uniqueTimestamps,
      ];
      const sortedChallenges = mergedChallenges.sort(
        (a, b) => b.completedDate - a.completedDate
      );
      const sortedTimestamps = mergedTimestamps.sort((a, b) => a - b);

      first.completedChallenges = sortedChallenges;
      first.progressTimestamps = sortedTimestamps;

      // carry over claimed certs
      for (const cert of certificationProperties) {
        if (doc[cert]) {
          first[cert] = true;
        }
      }

      // carry over optional profile details
      for (const prop of propertiesThatCanBeFalsy) {
        if (doc[prop] && !first[prop]) {
          first[prop] = doc[prop];
        }
      }
    }
    first.yearsTopContributor = [...new Set(yearsTopContributor)];
    first.profileUI = profilePrivacySettings;

    // after running through all documents, update the first one
    await users.findOneAndReplace({ _id: new ObjectId(first._id) }, first);
    usernames.push("FINAL: " + first.username);
    usernameLog.write(`${usernames.join(",")}\n`);

    // finally delete the rest
    for (const doc of rest) {
      await users.findOneAndDelete({ _id: new ObjectId(doc._id) });
    }
  }
})();
