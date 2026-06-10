import { createContext, type Dispatch, type SetStateAction } from "react";
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
  removeNotification: (id: string | undefined) => void;
  userData: UserData;
  setUserData: Dispatch<SetStateAction<UserData>>;
  serverStatus: ServerStatus;
}

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
