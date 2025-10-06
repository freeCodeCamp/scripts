import { Db, ObjectId } from 'mongodb';
import { log } from '../logger';

interface ExamEnvironmentExamModeration {
  _id: ObjectId;
  challengesAwarded?: boolean;
}

export async function migrate(db: Db) {
  const child = log.child({ collection: 'ExamEnvironmentExamModeration' });
  child.info('Starting migration for ExamEnvironmentExamModeration collection');
  const collection = db.collection<ExamEnvironmentExamModeration>(
    'ExamEnvironmentExamModeration'
  );

  const query = {
    challengesAwarded: { $exists: false },
    version: 1
  };

  const cursor = collection.find(query, {
    projection: { _id: 1 }
  });

  const updates: {
    _id: ExamEnvironmentExamModeration['_id'];
    challengesAwarded: boolean;
  }[] = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) break;

    updates.push({ _id: doc._id, challengesAwarded: false });
  }

  child.info(`Found ${updates.length} docs to migrate.`);

  if (!updates.length) {
    return;
  }

  // Perform updates in bulk for efficiency
  const bulk = collection.initializeUnorderedBulkOp();
  for (const u of updates) {
    bulk.find({ _id: u._id, ...query }).updateOne({
      $set: {
        challengesAwarded: u.challengesAwarded,
        version: 2
      }
    });
  }

  const result = await bulk.execute();
  child.info(
    `Bulk update complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`
  );
}
