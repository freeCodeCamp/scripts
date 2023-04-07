import fetch from "node-fetch";

import { crowdinProjectList } from "../config/crowdinProjectList";
import { globalConfig } from "../config/globalConfig";
import { Credentials } from "../interfaces/Credentials";
import { CrowdinContributor } from "../interfaces/crowdin/CrowdinContributor";
import { FinalReport } from "../interfaces/crowdin/FinalReport";
import { InitialReport } from "../interfaces/crowdin/InitialReport";
import { ReportDownloadUrl } from "../interfaces/crowdin/ReportDownloadUrl";
import { logHandler } from "../utils/logHandler";
import { sleep } from "../utils/sleep";

/**
 * Module to generate list of Crowdin contributors and aggregate their contributions.
 *
 * @param {Credentials} creds The credentials object.
 * @returns {Promise<FinalReport[]>} The list of contributors and their contributions.
 */
export const getCrowdinContributions = async (creds: Credentials) => {
  const apiHeader = {
    Authorization: `Bearer ${creds.crowdinKey}`,
    "Content-Type": "application/json",
  };

  const contributors: CrowdinContributor[] = [];

  for (const project of crowdinProjectList) {
    logHandler.log("info", `Starting project ${project.name}`);

    const reportBody = {
      name: "top-members",
      schema: {
        unit: "words",
        format: "json",
        dateFrom: new Date(globalConfig.start).toISOString(),
        dateTo: new Date(Date.now()).toISOString(),
      },
    };
    const rawReportData = await fetch(
      `https://freecodecamp.crowdin.com/api/v2/projects/${project.id}/reports`,
      {
        method: "POST",
        body: JSON.stringify(reportBody),
        headers: apiHeader,
      }
    );
    let parsedReportData: InitialReport = await rawReportData.json();
    const reportId = parsedReportData.data.identifier;
    let retries = 1;
    while (parsedReportData.data.status !== "finished") {
      logHandler.log(
        "info",
        `Waiting for ${project.name} - Attempt ${++retries}`
      );
      await sleep(3000);
      const rawReportStatus = await fetch(
        `https://freecodecamp.crowdin.com/api/v2/projects/${project.id}/reports/${reportId}`,
        {
          method: "GET",
          headers: apiHeader,
        }
      );
      parsedReportData = await rawReportStatus.json();
    }

    logHandler.log("info", `${project.name} report is ready.`);

    const rawReportDownload = await fetch(
      `https://freecodecamp.crowdin.com/api/v2/projects/${project.id}/reports/${reportId}/download`,
      {
        method: "GET",
        headers: apiHeader,
      }
    );
    const parsedReportDownload: ReportDownloadUrl =
      await rawReportDownload.json();

    logHandler.log("info", `${project.name} report is downloading...`);

    const rawReportDataDownload = await fetch(parsedReportDownload.data.url);
    const parsedReportDataDownload: FinalReport =
      await rawReportDataDownload.json();

    logHandler.log(
      "info",
      `${project.name} report is downloaded. Parsing data...`
    );

    for (const contributor of parsedReportDataDownload.data) {
      const name = contributor.user.fullName;
      const username = contributor.user.username;
      const contributions = contributor.translated + contributor.approved;
      const exists = contributors.find((el) => el.username === username);
      exists
        ? (exists.contributions += contributions)
        : contributors.push({ name, username, contributions });
    }
  }

  return contributors.sort((a, b) => b.contributions - a.contributions);
};
