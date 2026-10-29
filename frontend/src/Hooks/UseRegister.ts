// import ApiClient from "../apiServices/api_client";
// import type { RegisterFormValues } from "../features/auth/Schema/RegisterSchema";

// export interface RegisterCredentials {
//   full_name: string;
//   email: string;
//   password: string;
//   password_confirmation: string;
// }

// export interface RegisterApiResponse {
//   success: boolean;
//   message: string;
// }

// const apiClient = new ApiClient<
//   RegisterApiResponse,
//   RegisterCredentials
// >("/auth/register");

// export async function registerUser(
//   values: RegisterFormValues
// ): Promise<RegisterApiResponse> {
//   const {
//     full_name,
//     email,
//     password,
//     password_confirmation,
//   } = values;

//   return apiClient.post({
//     full_name,
//     email,
//     password,
//     password_confirmation,
//   });
// }



import ApiClient from "../apiServices/api_client";
import type { RegisterFormValues } from "../features/auth/Schema/RegisterSchema";

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterApiResponse {
  status: string;
  message: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "manager" | "admin";
  };
  token?: string;
}

const apiClient = new ApiClient<
  RegisterApiResponse,
  RegisterCredentials
>("/auth/signup");

export async function registerUser(
  values: RegisterFormValues
): Promise<RegisterApiResponse> {
  const response = await apiClient.post({
    name: values.full_name,
    email: values.email,
    password: values.password,
    confirmPassword: values.password_confirmation,
  });

  if (response.status !== "success") {
    throw new Error(response.message || "Registration failed");
  }

  return response;
}
