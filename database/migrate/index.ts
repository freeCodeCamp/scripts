import { MongoClient } from "mongodb";

import { migrate as migrateExamCreatorUser } from "./collections/exam-creator-user";
import { migrate as migrateExamCreatorExam } from "./collections/exam-creator-exam";
import { migrate as migrateExamEnvironmentExam } from "./collections/exam-environment-exam";
import { migrate as migrateExamEnvironmentChallenge } from "./collections/exam-environment-challenge";
import { migrate as migrateExamEnvironmentExamAttempt } from "./collections/exam-environment-exam-attempt";
import { migrate as migrateExamEnvironmentExamModeration } from "./collections/exam-environment-exam-moderation";

import { log } from "./logger";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("MONGOHQ_URL env var is required. Aborting.");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGODB_URI as string);
  try {
    await client.db("admin").command({ ping: 1 });
    log.info("Connected to MongoDB");
    const db = client.db("freecodecamp");
    await Promise.all([
      migrateExamCreatorUser(db),
      migrateExamCreatorExam(db),
      migrateExamEnvironmentExam(db),
      migrateExamEnvironmentChallenge(db),
      migrateExamEnvironmentExamAttempt(db),
      migrateExamEnvironmentExamModeration(db),
    ]);
    log.info("Migration completed successfully.");
  } catch (err) {
    log.error("Migration failed:");
    log.error(err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main().catch(console.error);
