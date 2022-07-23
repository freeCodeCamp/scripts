import fetch from "node-fetch";

import { Discourse, Topic } from "./interfaces/Discourse";

import { Align, getMarkdownTable } from 'markdown-table-ts';

(async () => {
  const topics: Topic[] = [];
  let page = 0;
  let limit = 100;
  let block = "";
  let displayType = "";

  const specificLimit = process.argv.find((el) => el.startsWith("posts="));
  if (specificLimit) {
    limit = parseInt(specificLimit.split("=")[1]);
    if (isNaN(limit)) {
      throw new Error("Invalid posts limit");
    }
  }

  const specificBlock = process.argv.find((el) => el.startsWith("block="));
  if (specificBlock) {
    block = specificBlock.split("=")[1];
  }

  const projectsOnly = process.argv.find((el) => el.startsWith("project"));

  const specificDisplay = process.argv.find((el) => el.startsWith("display"));
  if (specificDisplay) {
    displayType = specificDisplay.split("=")[1];
  }

  while (topics.length < limit) {
    console.log(`Fetching page ${page} - ${topics.length}/${limit}`);
    const response = await fetch(
      `https://forum.freecodecamp.org/latest.json?no_definitions=true&page=${page}`
    );
    const data: Discourse = await response.json();
    topics.push(...data.topic_list.topics);
    page++;
    console.log(`Loaded ${topics.length} topics`);
  }

  const topicNames = topics
    .filter((topic) => !topic.closed)
    .map((topic) => topic.title);
  const defaultHelpTitles = topicNames.filter((title) =>
    /^[\w\W]*\s-\s[\w\W]/i.test(title)
  );

  const counts: { [key: string]: number } = {};

  for (const title of defaultHelpTitles) {
    const [block, step] = title.split(/\s+-\s*/g);

    let stepNum;
    if (projectsOnly) {
      stepNum = step.match(/step\s*\d+/i);
    }
    const blockStepString = projectsOnly
      ? `${block}-${stepNum}`
      : `${block}-${step}`;
    counts[blockStepString] = counts[blockStepString] + 1 || 1;
  }
  
  const dataArr = Object.entries(counts)
    .filter((el) => el[0].startsWith(block))
    .sort((a, b) => b[1] - a[1]);

  const paretoCounts = dataArr.reduce<{
    totalCount: number;
    arr: [string, number, number][];
  }>(
    (dataObj, [title, freq]) => {
      const totalCount = dataObj.totalCount + freq;
      const { arr } = dataObj;
      arr.push([title, freq, totalCount]);
      return { totalCount, arr };
    },
    { totalCount: 0, arr: [] }
  );
  
  const { totalCount, arr } = paretoCounts;
  const outputArr = arr.map(([ title, freq, cumulativeCount ]) => {
    const percent = (freq / totalCount * 100).toFixed(2);
    const cumaltivePerc = (cumulativeCount / totalCount * 100).toFixed(2);
    return [ title, String(freq), percent, cumaltivePerc ];
  });
 
 const strHeader = "Challenge/Step|Frequency|%|Cumulative %\n";
 const tableHeader =["Challenge/Step", "Frequency", "%", "Cumulative %"];

 const output = displayType === 'table'
   ? getMarkdownTable({
       table: {
         head: tableHeader,
         body: outputArr
       },
       alignment: [Align.Left, Align.Center, Align.Center, Align.Center]
     })
   : strHeader + outputArr.reduce((str, [topic, count, perc, cummaltivePerc]) => {
       return str += `${topic}|${count}|${perc}|${cummaltivePerc}\n`;
     }, '');   

  console.log(output);

})();
