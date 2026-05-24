import { createContext, useContext } from "react";
import type { User } from "./api";

export type AppContextValue = {
  user: User | null;
  refreshUser: (user: User) => Promise<void>;
};

export const AppContext = createContext<AppContextValue>({
  user: null,
  refreshUser: async () => undefined
});

export function useHyperVoice() {
  return useContext(AppContext);
}
