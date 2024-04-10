// After getting exam data with get-exams.js, this goes through the exams.json
// file and writes totals to analyzed-exams.json. Be sure to update the two
// numbers for linked accounts and certs claimed for accurate results. You will
// need to get those from the database.

const fs = require("fs");

const examJsonFile = "exams.json";

/*
 * Get the two variables below in the Atlas UI. linkedAccounts can be found
 * by checking the number of records in the MsUsername collection. certsClaimed
 * can be found by doing an aggregation on the user collection by following
 * these steps:
 * 1. Go to the user collection
 * 2. Click the aggregation tab
 * 3. Turn off the preview on the top right
 * 4. Add a new stage
 * 5. Disable the stage with the toggle next to the Stage 1 dropdown
 * 5. Put $match in the Stage 1 dropdown
 * 6. Put this in the Stage 1 query body: { isFoundationalCSharpCertV8: true }
 * 7. Add another new stage
 * 8. Disable the stage with the toggle next to the Stage 2 dropdown
 * 9. Put $group in the Stage 2 dropdown
 * 10. Put this in the Stage 2 query body: { _id: null, count: { $sum: 1 }}
 * 11. Enable the preview at the top right
 * 12. Enable Stage 1 and wait for it to finish, it only takes a few seconds
 * 13. Enable Stage 2 to see the number of certifications claimed
 */
const linkedAccounts = 0;
const certsClaimed = 0;

if (linkedAccounts === 0 || certsClaimed === 0) {
  console.error(
    "Process cancelled. Be sure to enter the linkedAccounts and certsClaimed values before running the script."
  );
  process.exit(1);
}

const scoreDistribution = {
  "0.0": 0,
  1.3: 0,
  2.5: 0,
  3.8: 0,
  "5.0": 0,
  6.3: 0,
  7.5: 0,
  8.8: 0,
  "10.0": 0,
  11.3: 0,
  12.5: 0,
  13.8: 0,
  "15.0": 0,
  16.3: 0,
  17.5: 0,
  18.8: 0,
  "20.0": 0,
  21.3: 0,
  22.5: 0,
  23.8: 0,
  "25.0": 0,
  26.3: 0,
  27.5: 0,
  28.7: 0,
  "30.0": 0,
  31.3: 0,
  32.5: 0,
  33.8: 0,
  "35.0": 0,
  36.3: 0,
  37.5: 0,
  38.8: 0,
  "40.0": 0,
  41.3: 0,
  42.5: 0,
  43.8: 0,
  "45.0": 0,
  46.3: 0,
  47.5: 0,
  48.8: 0,
  "50.0": 0,
  51.2: 0,
  52.5: 0,
  53.8: 0,
  "55.0": 0,
  56.3: 0,
  57.5: 0,
  58.8: 0,
  "60.0": 0,
  61.3: 0,
  62.5: 0,
  63.7: 0,
  "65.0": 0,
  66.3: 0,
  67.5: 0,
  68.8: 0,
  "70.0": 0,
  71.3: 0,
  72.5: 0,
  73.8: 0,
  "75.0": 0,
  76.3: 0,
  77.5: 0,
  78.8: 0,
  "80.0": 0,
  81.3: 0,
  82.5: 0,
  83.8: 0,
  "85.0": 0,
  86.3: 0,
  87.5: 0,
  88.8: 0,
  "90.0": 0,
  91.3: 0,
  92.5: 0,
  93.8: 0,
  "95.0": 0,
  96.3: 0,
  97.5: 0,
  98.8: 0,
  "100.0": 0,
};

const numberOfExamsPerUser = {};

fs.readFile(examJsonFile, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    return;
  }

  try {
    const examJson = JSON.parse(data);

    const usersWhoCompletedAnExam = examJson.length;

    let usersWhoPassedAnExam = 0;
    let usersWhoCompletedAndNotPassedAnExam = 0;
    let usersWhoHaveTakenMoreThanOneExam = 0;
    let totalExamsTaken = 0;
    let totalExamsPassed = 0;
    let totalTimeTaken = 0;
    let totalPercentCorrect = 0;

    examJson.forEach((userExamsArray) => {
      const numberOfUserExams = userExamsArray.length;
      const numberOfUserExamsStr = numberOfUserExams.toString();

      numberOfUserExamsStr in numberOfExamsPerUser
        ? numberOfExamsPerUser[numberOfUserExamsStr]++
        : (numberOfExamsPerUser[numberOfUserExamsStr] = 1);

      // see if this user has passed at least one exam
      if (userExamsArray.some((exam) => exam.examResults?.passed)) {
        usersWhoPassedAnExam++;
      } else {
        usersWhoCompletedAndNotPassedAnExam++;
      }

      if (numberOfUserExams > 1) {
        usersWhoHaveTakenMoreThanOneExam++;
      }

      userExamsArray.forEach((exam) => {
        const {
          examResults: { passed, examTimeInSeconds, percentCorrect },
        } = exam;

        const percentCorrectString = Number.parseFloat(percentCorrect)
          .toFixed(1)
          .toString();

        if (percentCorrectString in scoreDistribution) {
          scoreDistribution[percentCorrectString]++;
        } else {
          throw Error(
            `${percentCorrectString} not found in 'scoreDistribution' object. Something went wrong.`
          );
        }

        totalExamsTaken++;
        if (passed) totalExamsPassed++;
        totalTimeTaken += examTimeInSeconds;
        totalPercentCorrect += percentCorrect;
      });
    });

    const totalExamsNotPassed = totalExamsTaken - totalExamsPassed;
    const averagePercentCorrect = parseFloat(
      (totalPercentCorrect / totalExamsTaken).toFixed(1)
    );
    const averageExamTime = Math.round(totalTimeTaken / totalExamsTaken);
    const usersWhoPassedAnExamAndNotClaimedCert =
      usersWhoPassedAnExam - certsClaimed;
    const averageExamsPerUser = parseFloat(
      (totalExamsTaken / usersWhoCompletedAnExam).toFixed(2)
    );

    const finalObj = {
      linkedAccounts,
      certsClaimed,
      examData: {
        totalExamsTaken,
        totalExamsPassed,
        totalExamsNotPassed,
        averagePercentCorrect,
        averageExamTime,
      },
      scoreDistribution,
      uniqueUserData: {
        usersWhoCompletedAnExam,
        usersWhoPassedAnExam,
        usersWhoCompletedAndNotPassedAnExam,
        usersWhoPassedAnExamAndNotClaimedCert,
        usersWhoHaveTakenMoreThanOneExam,
        averageExamsPerUser,
      },
      numberOfExamsPerUser,
    };

    fs.writeFileSync(
      "analyzed-exams.json",
      JSON.stringify(finalObj, null, 2),
      "utf-8"
    );

    console.log(`Done writing data to 'analyzed-exams.json'`);
  } catch (parseError) {
    console.error(`Error parsing JSON: ${parseError}`);
  }
});
