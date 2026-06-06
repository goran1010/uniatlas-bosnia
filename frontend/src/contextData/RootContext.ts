import { createContext } from "react";
import { type ServerStatus } from "../utils/serverStatus";

import { type Notification } from "../customHooks/useNotification";
import type { UserData } from "../customHooks/useStatusCheck";
import type { Language, SetLanguage } from "../customHooks/useLanguage";

export interface RootContextType {
  language: Language;
  setLanguage: SetLanguage;
  t: (key: string) => string;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
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
