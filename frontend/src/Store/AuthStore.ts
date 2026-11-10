import { create } from "zustand";
import { persist } from "zustand/middleware";
import { removeToken, setToken } from "../apiServices/cookie";
import type { UserRole } from "../Entities/UserRole";

interface AuthState {
  full_name: string | null;
  token: string | null;
  role: UserRole | null;
  setAuth: (data: { full_name: string; token: string; role: UserRole }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      full_name: null,
      token: null,
      role: null,
      setAuth: ({ full_name, token, role }) => {
        setToken(token);
        set({ full_name, token, role });
      },
      logout: () => {
        removeToken();
        set({ full_name: null, token: null, role: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
