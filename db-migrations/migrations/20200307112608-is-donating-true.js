const getItems = require("../utils/get-items");
const asyncForEach = require("../utils/async-for-each");

const logger = (index, msg, param) => {
  index = index + "";
  console.log(index.padStart(6, 0) + msg.padStart(60, " ") + " " + param);
};

module.exports = {
  async up(db, client) {
    const emails = getItems("active-donors.txt");
    await asyncForEach(emails, async (email, index) => {
      const log = (m, p) => logger(index, m, p);
      console.log("");
      log("Looking for donation(s) linked to email:", email);
      await db
        .collection("Donation")
        .findOne({ email: email }, async (err, donation) => {
          if (err || !donation) {
            log("[INDIRECT] [FAILURE] Donation collection object for:", email);
            return;
          }
          const { userId } = donation;
          db.collection("user").updateOne(
            { _id: userId },
            { $set: { isDonating: true } },
            err => {
              if (err) {
                log(
                  "[INDIRECT] [FAILURE] updating isDonating flag for:",
                  userId
                );
                return;
              }
              log("[INDIRECT] [SUCCESS] updating isDonating flag for:", userId);
            }
          );
        });
      await db
        .collection("user")
        .updateOne(
          { email: email },
          { $set: { isDonating: true } },
          async (err, result) => {
            if (err) {
              log("[DIRECT] [CRITICAL] error occurred in migrating: ", email);
              return;
            }
            const { modifiedCount } = result;
            modifiedCount
              ? log("[DIRECT] [SUCCESS] updating isDonating flag for:", email)
              : log("[DIRECT] [FAILURE] updating isDonating flag for:", email);
          }
        );
    });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
