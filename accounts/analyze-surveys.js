// After getting survey data with get-surveys.js, this goes through the
// surveys.json file and writes totals to analyzed-surveys.json

const fs = require('fs');

const surveyResults = {};

fs.readFile('surveys.json','utf8', (err, data) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    return;
  }

  try {
    const surveyJson = JSON.parse(data);

    surveyJson.forEach((survey) => {
      survey.forEach((surveyResponse) => {
        const { question, response } = surveyResponse;

        if (!surveyResults.hasOwnProperty(question)) {
          surveyResults[question] = {};
        }

        if (surveyResults[question].hasOwnProperty(response)) {
          surveyResults[question][response]++;
        } else {
          surveyResults[question][response] = 1;
        }
      });
    });

    fs.writeFileSync(
      'analyzed-surveys.json',
      JSON.stringify(surveyResults, null, 2),
      'utf-8'
    );

    console.log(`Done writing data to 'analyzed-surveys.json'`);
  } catch (parseError) {
    console.error(`Error parsing JSON: ${parseError}`);
  }
});
