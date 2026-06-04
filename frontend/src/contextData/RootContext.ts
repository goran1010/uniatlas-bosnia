import { createContext } from "react";
import { type ServerStatus } from "../utils/serverStatus";

import { type Notification } from "../customHooks/useNotification";

export interface RootContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  notifications: Array<Notification>;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  userData: {
    email: string;
    role: string;
  } | null;
  setUserData: (userData: { email: string; role: string } | null) => void;
  serverStatus: ServerStatus;
}

const RootContext = createContext<RootContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  userData: null,
  setUserData: () => {},
  serverStatus: "live",
});

export { RootContext };
