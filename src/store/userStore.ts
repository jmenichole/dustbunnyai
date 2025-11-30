import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
