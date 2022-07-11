import fetch from "node-fetch";

import { Discourse, Topic } from "./interfaces/Discourse";

(async () => {
  const topics: Topic[] = [];
  let page = 0;

  while (topics.length < 100) {
    console.log(`Fetching page ${page}`);
    const response = await fetch(
      `https://forum.freecodecamp.org/latest.json?no_definitions=true&page=${page}`
    );
    const data: Discourse = await response.json();
    topics.push(...data.topic_list.topics);
    page++;
    console.log(`Loaded ${topics.length} topics`);
  }

  const topicNames = topics.map((topic) => topic.title);
  const defaultHelpTitles = topicNames.filter((title) =>
    /[\w\W]*\s-\s[\w\W]*\s-\s[\w\W]*/i.test(title)
  );

  const counts: { [key: string]: number } = {};

  for (const title of defaultHelpTitles) {
    const [block, step] = title.split(/\s+-\s*/g);
    const blockStepString = `${block}-${step}`;
    counts[blockStepString] = counts[blockStepString] + 1 || 1;
  }

  console.log(Object.entries(counts).sort((a, b) => b[1] - a[1]));
})();
