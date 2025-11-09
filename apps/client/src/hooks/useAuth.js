import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "setvices/api";

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isGuest: false,
      loading: false,

      login: async (email, password) => {
        const response = await api.post("/auth/login", { email, password });
        const { user, token } = response.data.data;

        set({ user, token, isGuest: false });

        localStorage.setItem("token", token);

        return user;
      },

      guestLogin: async () => {
        const response = await api.post("/auth/guest-login");
        const { user, token, isGuest } = response.data.data;

        set({ user, token, isGuest });

        localStorage.setItem("token", token);

        return user;
      },

      register: async (username, email, password) => {
        const response = await api.post("/auth/register", {
          username,
          email,
          password,
        });

        const { user, token } = response.data.data;

        set({ user, token, isGuest: false });

        localStorage.setItem("token", token);

        return user;
      },

      convertGuestToUser: async (username, email, password) => {
        const response = await api.post("/auth/convert-guest", {
          username,
          email,
          password,
        });

        const { user } = response.data.data;

        set({ user, isGuest: false });

        return user;
      },

      logout: () => {
        set({ user: null, token: null, isGuest: false });
        localStorage.removeItem("token");
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await api.get("/auth/me");
          const { user, isGuest } = response.data.data;
          set({ user, token, isGuest });
        } catch (error) {
          set({ user: null, token: null, isGuest: false });
          localStorage.removeItem("token");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isGuest: state.isGuest,
      }),
    },
  ),
);
