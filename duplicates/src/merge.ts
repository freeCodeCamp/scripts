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
];

const propertiesThatCanBeFalsy = [
  "name",
  "website",
  "twitter",
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

(async () => {
  // validate that the properties being edited are still on the schema.
  const userModelFromRepo = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/api-server/src/common/models/user.json"
  );
  const userModel = await userModelFromRepo.json();
  if (!certificationProperties.every((prop) => prop in userModel.properties)) {
    throw new Error("Invalid certification keys.");
  }
  if (!propertiesThatCanBeFalsy.every((prop) => prop in userModel.properties)) {
    throw new Error("Invalid falsy keys.");
  }
  if (
    !Object.keys(defaultProfileUI).every(
      (prop) => prop in userModel.properties.profileUI.default
    )
  ) {
    throw new Error("Invalid profile UI");
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
    replicaSet: "atlas-axsdig-shard-0",
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

      if (doc.yearsTopContributor?.length) {
        yearsTopContributor.push(...doc.yearsTopContributor);
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
