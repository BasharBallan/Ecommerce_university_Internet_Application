import ApiClient from "../apiServices/api_client";
import type { RegisterFormValues } from "../features/auth/Schema/RegisterSchema";

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterApiResponse {
  success: boolean;
  message: string;
}

const apiClient = new ApiClient<
  RegisterApiResponse,
  RegisterCredentials
>("/auth/register");

export async function registerUser(
  values: RegisterFormValues
): Promise<RegisterApiResponse> {
  const {
    full_name,
    email,
    password,
    password_confirmation,
  } = values;

  return apiClient.post({
    full_name,
    email,
    password,
    password_confirmation,
  });
}