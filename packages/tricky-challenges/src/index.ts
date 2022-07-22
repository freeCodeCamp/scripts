import fetch from "node-fetch";

import { Discourse, Topic } from "./interfaces/Discourse";

(async () => {
  const topics: Topic[] = [];
  let page = 0;
  let limit = 100;
  let block = "";

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
    const blockStepString = `${block}-${step}`;
    counts[blockStepString] = counts[blockStepString] + 1 || 1;
  }

  block
    ? console.log(
        Object.entries(counts)
          .filter((el) => el[0].startsWith(block))
          .sort((a, b) => b[1] - a[1])
      )
    : console.log(Object.entries(counts).sort((a, b) => b[1] - a[1]));
})();
