// // import ApiClient from "../apiServices/api_client";

// // import type {
// //   AuthUser,
// //   LoginApiResponse,
// //   LoginCredentials,
// //   LoginResponse,
// // } from "../Entities/LoginData";

// // import type { LoginFormValues } from "../features/auth/Schema/LoginSchema";

// // const apiClient = new ApiClient<
// //   LoginApiResponse,
// //   LoginCredentials
// // >("/auth/login");

// // export async function loginUser(
// //   credentials: LoginFormValues
// // ): Promise<LoginResponse> {
// //   const response = await apiClient.post(credentials);

// //   if (!response.success) {
// //     throw new Error(response.message || "Login failed");
// //   }

// //   const user: AuthUser = response.data.user;

// //   return {
// //     user,
// //     accessToken: response.data.access_token,
// //   };
// // }




// import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

// import ApiClient from "../apiServices/api_client";
// import type {
//   LoginApiResponse,
//   LoginCredentials,
// } from "../Entities/LoginData";

// import { useAuthStore } from "../Store/AuthStore";

// const apiClient = new ApiClient<
//   LoginApiResponse,
//   LoginCredentials
// >("/auth/login");

// export const useAuth = () => {
//   const navigate = useNavigate();

//   const setAuth = useAuthStore((state) => state.setAuth);

//   return useMutation({
//     mutationKey: ["login"],

//     mutationFn: async (credentials: LoginCredentials) => {
//       const response = await apiClient.post(credentials);

//       if (!response.success) {
//         throw new Error(response.message || "Login failed");
//       }

//       return response;
//     },

//     onSuccess: (response) => {
//       const user = response.data.user;
//       const token = response.data.access_token;

//       setAuth({
//         full_name: user.full_name,
//         token,
//         role: user.role,
//         // role: "admin", // Hardcoded role for demonstration purposes
//       });

//       navigate("/");
//     },

//     onError: (error) => {
//       console.error("Login failed:", error);
//     },
//   });
// };

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ApiClient from "../apiServices/api_client";
import type {
  LoginApiResponse,
  LoginCredentials,
} from "../Entities/LoginData";
import { useAuthStore } from "../Store/AuthStore";
import type { UserRole } from "../Entities/UserRole";

const apiClient = new ApiClient<
  LoginApiResponse,
  LoginCredentials
>("/auth/login");

const allowedRoles: UserRole[] = ["user", "manager", "admin"];

export const useAuth = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationKey: ["login"],

    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post(credentials);
console.log(response.data)
      if (response.status !== "success" || !response.token) {
        throw new Error(response.message || "Login failed");
      }

      if (!allowedRoles.includes(response.data.role)) {
        throw new Error("Invalid user role");
      }

      return response;
    },

    onSuccess: (response) => {
      const backendUser = response.data;

      setAuth({
        full_name: backendUser.name,
        token: response.token,
        role: backendUser.role,
      });

      // التوجيه الذكي حسب الـ Role القادم من الباك إند
      if (backendUser.role === "admin") {
        navigate("/admin"); // توجيه الأدمن إلى لوحة التحكم
      } else {
        navigate("/"); // توجيه المستخدم العادي إلى الصفحة الرئيسية
      }
    },


    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};
