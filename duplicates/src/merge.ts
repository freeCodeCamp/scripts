import { readFile } from "fs/promises";
import { join } from "path";

import { MongoClient, ObjectId } from "mongodb";
import Spinnies from "spinnies";
import { userSchema } from "./schema";

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
  "isHonest",
  "isCheater",
  "acceptedPrivacyTerms",
  "isDonating",
];

(async () => {
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
    const firstChallengeIds = first.completedChallenges.map((el) => el.id);
    const firstTimestamps = first.progressTimestamps;

    for (const doc of rest) {
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
        (a, b) => a.completedDate - b.completedDate
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

      // delete duplicate
      // await users.findOneAndDelete({ _id: new ObjectId(doc._id) });
    }

    // after running through all documents, update the first one
    // await users.findOneAndUpdate({ _id: new ObjectId(first._id) }, first);
    console.log(first);
  }
})();
