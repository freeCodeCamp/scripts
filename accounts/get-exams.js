/* eslint-disable no-process-exit */

// After running the script and getting the JSON output,
// you need to manually remove the last comma in the output file

require("dotenv").config();

const Stream = require("stream");
const fs = require("fs");
const mongodb = require("mongodb");
const ora = require("ora");

const MongoClient = mongodb.MongoClient;

const outputFile = fs.createWriteStream("exams.json", { encoding: "utf8" });

outputFile.write("[\n");

const rs = new Stream.Readable({ objectMode: true });
rs._read = function () {};

rs.on("data", ({ completedExams }) => {
  if (Array.isArray(completedExams)) {
    completedExams.forEach((exam) => {
      const jsonStr = JSON.stringify(exam);
      outputFile.write(`${jsonStr},\n`);
    });
  } else {
    // All exams written (hopefully) - This writes the closing "]" for the array
    outputFile.write(`${completedExams}\n`);
  }
});

const { MONGO_DB, MONGO_PASSWORD, MONGO_RS, MONGO_USER, MONGODB_URI } =
  process.env;

MongoClient.connect(
  MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    replicaSet: MONGO_RS,
    auth: { user: MONGO_USER, password: MONGO_PASSWORD },
    poolSize: 20,
  },
  function (err, client) {
    if (err) {
      throw err;
    }
    const db = client.db(MONGO_DB);

    const stream = db
      .collection("user")
      .find(
        { "completedExams.0": { $exists: true } },
        {
          completedExams: 1,
        }
      )
      .batchSize(100)
      .stream();

    const spinner = ora("Begin querying completedExams ...");
    spinner.start();

    stream.on("data", ({ completedExams }) => {
      const data = { completedExams };

      rs.push(data);
    });

    stream.on("end", () => {
      rs.push({ completedExams: "]" });
      client.close();
      spinner.succeed(
        `Completed compiling exams taken. Be sure to go delete the comma after the last object :)`
      );
    });
  }
);
