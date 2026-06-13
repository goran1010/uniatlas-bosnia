import { createContext } from "react";

import type { RootContextType } from "./types";

const RootContext = createContext<RootContextType>({
  language: "en",
  setLanguage: (prop) => prop,
  t: (prop) => prop,
  notifications: [],
  addNotification: (prop) => prop,
  removeNotification: (prop) => prop,
  userData: null,
  setUserData: (prop) => prop,
  serverStatus: "live",
});

export { RootContext };
export type { RootContextType } from "./types";
