export interface InitialReport {
  data: {
    identifier: string;
    status: string;
    progress: number;
    attributes: {
      reportName: string;
      schema: {
        unit: "strings" | "words" | "chars" | "chars_with_spaces";
        languageId?: string;
        format: "xlsx" | "csv" | "json";
        dateFrom?: string;
        dateTo?: string;
      };
    };
    createdAt: string;
    updatedAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    eta: string | null;
  };
}
