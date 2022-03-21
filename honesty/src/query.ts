import Stream from "stream";
import { createWriteStream } from "fs";

import { MongoClient } from "mongodb";
import { userSchema } from "./schema";
import Spinnies from "spinnies";
import { getChallengeSolutions } from "./getChallengeSolutions";

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

(async () => {
  const dbClient = await MongoClient.connect(
    process.env.MONGO_URI as string,
    {
      replicaSet: "atlas-axsdig-shard-0",
      maxPoolSize: 20,
    }
  );
  console.log("Connected to MongoDB");

  const db = dbClient.db("freecodecamp");
  const users = db.collection("user");

  const isFrontEndCertLogs = createWriteStream(
    "./logs/isFrontEndCert.csv",
    "utf-8"
  );
  const isDataVisCertLogs = createWriteStream(
    "./logs/isDataVisCert.csv",
    "utf-8"
  );
  const isBackEndCertLogs = createWriteStream(
    "./logs/isBackEndCert.csv",
    "utf-8"
  );
  const isRespWebDesignCertLogs = createWriteStream(
    "./logs/isRespWebDesignCert.csv",
    "utf-8"
  );
  const is2018DataVisCertLogs = createWriteStream(
    "./logs/is2018DataVisCert.csv",
    "utf-8"
  );
  const isFrontEndLibsCertLogs = createWriteStream(
    "./logs/isFrontEndLibsCert.csv",
    "utf-8"
  );
  const isJsAlgoDataStructCertLogs = createWriteStream(
    "./logs/isJsAlgoDataStructCert.csv",
    "utf-8"
  );
  const isApisMicroservicesCertLogs = createWriteStream(
    "./logs/isApisMicroservicesCert.csv",
    "utf-8"
  );
  const isInfosecQaCertLogs = createWriteStream(
    "./logs/isInfosecQaCert.csv",
    "utf-8"
  );
  const isQaCertV7Logs = createWriteStream("./logs/isQaCertV7.csv", "utf-8");
  const isInfosecCertV7Logs = createWriteStream(
    "./logs/isInfosecCertV7.csv",
    "utf-8"
  );
  const isSciCompPyCertV7Logs = createWriteStream(
    "./logs/isSciCompPyCertV7.csv",
    "utf-8"
  );
  const isDataAnalysisPyCertV7Logs = createWriteStream(
    "./logs/isDataAnalysisPyCertV7.csv",
    "utf-8"
  );
  const isMachineLearningPyCertV7Logs = createWriteStream(
    "./logs/isMachineLearningPyCertV7.csv",
    "utf-8"
  );

  const rs = new Stream.Readable({ objectMode: true });
  rs._read = () => {};

  rs.on("data", (document: userSchema) => {
    if (document.isFrontEndCert) {
      const data = getChallengeSolutions("isFrontEndCert", document);
      isFrontEndCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isDataVisCert) {
      const data = getChallengeSolutions("isDataVisCert", document);
      isDataVisCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isBackEndCert) {
      const data = getChallengeSolutions("isBackEndCert", document);
      isBackEndCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isRespWebDesignCert) {
      const data = getChallengeSolutions("isRespWebDesignCert", document);
      isRespWebDesignCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.is2018DataVisCert) {
      const data = getChallengeSolutions("is2018DataVisCert", document);
      is2018DataVisCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isFrontEndLibsCert) {
      const data = getChallengeSolutions("isFrontEndLibsCert", document);
      isFrontEndLibsCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isJsAlgoDataStructCert) {
      const data = getChallengeSolutions("isJsAlgoDataStructCert", document);
      isJsAlgoDataStructCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isApisMicroservicesCert) {
      const data = getChallengeSolutions("isApisMicroservicesCert", document);
      isApisMicroservicesCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isInfosecQaCert) {
      const data = getChallengeSolutions("isInfosecQaCert", document);
      isInfosecQaCertLogs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isQaCertV7) {
      const data = getChallengeSolutions("isQaCertV7", document);
      isQaCertV7Logs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isInfosecCertV7) {
      const data = getChallengeSolutions("isInfosecCertV7", document);
      isInfosecCertV7Logs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isSciCompPyCertV7) {
      const data = getChallengeSolutions("isSciCompPyCertV7", document);
      isSciCompPyCertV7Logs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isDataAnalysisPyCertV7) {
      const data = getChallengeSolutions("isDataAnalysisPyCertV7", document);
      isDataAnalysisPyCertV7Logs.write(`${document._id},${data?.join(",")}\n`);
    }
    if (document.isMachineLearningPyCertV7) {
      const data = getChallengeSolutions("isMachineLearningPyCertV7", document);
      isMachineLearningPyCertV7Logs.write(
        `${document._id},${data?.join(",")}\n`
      );
    }
  });

  const stream = users
    .find(
      {
        $or: [
          { isFrontEndCert: true },
          { isDataVisCert: true },
          { isBackEndCert: true },
          { isRespWebDesignCert: true },
          { is2018DataVisCert: true },
          { isFrontEndLibsCert: true },
          { isJsAlgoDataStructCert: true },
          { isApisMicroservicesCert: true },
          { isInfosecQaCert: true },
          { isQaCertV7: true },
          { isInfosecCertV7: true },
          { isSciCompPyCertV7: true },
          { isDataAnalysisPyCertV7: true },
          { isMachineLearningPyCertV7: true },
        ],
      },
      {
        projection: {
          _id: 1,
          isFrontEndCert: 1,
          isDataVisCert: 1,
          isBackEndCert: 1,
          isRespWebDesignCert: 1,
          is2018DataVisCert: 1,
          isFrontEndLibsCert: 1,
          isJsAlgoDataStructCert: 1,
          isApisMicroservicesCert: 1,
          isInfosecQaCert: 1,
          isQaCertV7: 1,
          isInfosecCertV7: 1,
          isSciCompPyCertV7: 1,
          isDataAnalysisPyCertV7: 1,
          isMachineLearningPyCertV7: 1,
          completedChallenges: 1,
        },
      }
    )
    .batchSize(50)
    .stream();

  spinnies.add("query", {
    color: "magenta",
    text: "Running database query...",
  });

  stream.on("data", (document: userSchema) => {
    stream.pause();
    spinnies.update("query", { text: `Processing user ${document._id}` });
    rs.push(document);
    stream.resume();
  });

  stream.on("end", () => {
    rs.push(null);
    dbClient.close();
    spinnies.succeed("query", { text: "All done!" });
  });
})();
