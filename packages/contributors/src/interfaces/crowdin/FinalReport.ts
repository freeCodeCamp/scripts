interface ContributorInt {
  user: UserInt;
  languages: LanguageInt[];
  translated: number;
  approved: number;
  voted: number;
  positiveVotes: number;
  negativeVotes: number;
  winning: number;
}

interface UserInt {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
}

interface LanguageInt {
  id: string;
  name: string;
}

export interface FinalReport {
  name: string;
  url: string;
  unit: string;
  dateRange: {
    from: string;
    to: string;
  };
  language: string;
  data: ContributorInt[];
}
