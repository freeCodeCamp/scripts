export interface UserList {
  users: {
    _id: string;
    username: string;
    emails: {
      address: string;
      verified: boolean;
    }[];
    status: string;
    active: boolean;
    roles: string[];
    name: string;
    nameInsensitive: string;
  }[];
  count: number;
  offset: number;
  total: number;
  success: boolean;
}
