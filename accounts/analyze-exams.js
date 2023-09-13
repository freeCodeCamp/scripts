// After getting exam data with get-exams.js,
// this goes through that info and gives some totals

const fs = require("fs");
const filePath = "exams.json";

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    return;
  }

  try {
    const examJson = JSON.parse(data);

    const totalExamsTaken = examJson.length;
    let totalExamsPassed = 0;
    let totalTimeTaken = 0;
    let totalPercentCorrect = 0;

    examJson.forEach((exam) => {
      const {
        examResults: { passed, examTimeInSeconds, percentCorrect },
      } = exam;

      if (passed) totalExamsPassed++;
      totalTimeTaken += examTimeInSeconds;
      totalPercentCorrect += percentCorrect;
    });

    const averagePercentCorrect = totalPercentCorrect / totalExamsTaken;
    const averageExamTime = totalTimeTaken / totalExamsTaken;

    console.log(`${totalExamsTaken} exams were completed.`);
    console.log(`${totalExamsPassed} exams passed.`);
    console.log(`${totalExamsTaken - totalExamsPassed} exams did not pass.`);
    console.log(`The average score was ${averagePercentCorrect}% correct`);
    console.log(`The average time taken was ${averageExamTime} seconds`);

  } catch (parseError) {
    console.error(`Error parsing JSON: ${parseError}`);
  }
});
