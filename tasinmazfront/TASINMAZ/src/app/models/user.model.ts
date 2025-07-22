export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  selected?: boolean;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  User: User;
  Token: string;
}

// export enum Role {
//   User = 0,
//   Admin = 1,
// }
