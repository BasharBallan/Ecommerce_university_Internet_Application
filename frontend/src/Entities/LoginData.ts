// import type { UserRole } from "./UserRole";

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface AuthUser {
//   id: number;
//   full_name: string;
//   email: string;
//   phone: string;
//   image: string | null;
//   role: UserRole;
// }

// export interface LoginApiResponse {
//   success: boolean;
//   status: number;
//   message: string;
//   data: {
//     access_token: string;
//     token_type: "Bearer";
//     user: AuthUser;
//   };
//   errors: Record<string, string[]> | null;
// }

// // الشكل الذي ستستخدمه الواجهة بعد تحويل استجابة API
// export interface LoginResponse {
//   user: AuthUser;
//   accessToken: string;
// }

import type { UserRole } from "./UserRole";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface BackendAuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImg?: string | null;
  role: UserRole;
}

export interface LoginApiResponse {
  status: "success";
  message: string;
  data: BackendAuthUser;
  token: string;
}